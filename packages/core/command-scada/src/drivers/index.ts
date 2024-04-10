import { BaseCommandDriver } from '@hive-command/drivers-base';
import { ModuleThread, Worker, spawn } from '@hive-command/threads'
import {
    Cache,
    Configuration,
    Descriptor,
    LightReport,
    Manifest,
    Project,
    Workspace,
    structUtils 
} from '@yarnpkg/core';

import { isEqual } from 'lodash'
import { Observable } from 'observable-fns'

import path from 'path';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import PluginPnp from '@yarnpkg/plugin-pnp';
import PluginNm from '@yarnpkg/plugin-nm';
import PluginNpm from '@yarnpkg/plugin-npm';

import { PortablePath, npath } from '@yarnpkg/fslib';
import { EventedValueStore } from '@hive-command/evented-values';

const { 
    makeDescriptor, 
    makeIdent
} = structUtils;

const yarn_plugins : any[] = [
    '@yarnpkg/plugin-pnp',
    '@yarnpkg/plugin-npm',
    '@yarnpkg/plugin-nm',
]

const imported_plugins = [
    ['@yarnpkg/plugin-pnp', PluginPnp],
    ['@yarnpkg/plugin-npm', PluginNpm],
    ['@yarnpkg/plugin-nm', PluginNm]
]

export interface DriverRegistryOptions {
    pluginDir: string;
    valueStore: EventedValueStore
}

export class DriverRegistry {

    private drivers : {[key: string]: ModuleThread} = {};
    private driverConfigurations: {[key: string]: any} = {};

    private options : DriverRegistryOptions;

    private yarnPath : PortablePath;
    private yarnConfiguration? : Configuration;
    private yarnCache?: Cache;

    private yarnProject?: Project;
    private yarnWorkspace?: Workspace | null;

    constructor(options: DriverRegistryOptions){
        this.options = options;

        this.yarnPath = npath.toPortablePath(this.options.pluginDir)

        if(!existsSync(this.options.pluginDir)){
            mkdirSync(this.options.pluginDir)
        }else{
            if(!existsSync(path.join(this.options.pluginDir, 'package.json'))){
                throw new Error("Plugin directory not empty or setup properly")
            }
        }
    }

    async allReady(){
        const ready_arr = await Promise.all(
            Object.keys(this.drivers).map(async (key) => await this.drivers[key].ready())
        )
        
        return ready_arr.indexOf(false) < 0
    }

    get yarnManifest() : Manifest | null | undefined{
        return this.yarnWorkspace?.manifest;
    }

    async setup(){

        await this.setupManifest()
        console.log("Setup manifest");

        this.yarnConfiguration = await Configuration.find(this.yarnPath, {
            modules: new Map(imported_plugins.map((plugin) => plugin) as any),
            plugins: new Set(yarn_plugins)
        });

        this.yarnConfiguration.use(`<compat>`, { 
            nodeLinker: `node-modules`,
            checksumBehavior: "update"
            // enableTransparentWorkspaces: true,
            // nmMode: 'hardlinks-local',
        }, this.yarnPath, {
            overwrite: true
        })

        await this.setupProject(this.yarnConfiguration)
        console.log("Setup project");

        this.yarnCache = await Cache.find(this.yarnConfiguration)
        console.log("Found cache")
    }

    private async setupManifest(){
        
        try{ 
            await Manifest.find(this.yarnPath)
        }catch(err: any){
            if(err.message == 'Manifest not found'){
                const m = new Manifest();
                m.name = makeIdent('hive-command', 'plugins')
                // m.private = true;

                const pkg = m.exportTo({})
                
                if(!existsSync(path.join(this.options.pluginDir, 'yarn.lock'))){
                    writeFileSync(path.join(this.options.pluginDir, 'yarn.lock'), '', 'utf8');
                }

                writeFileSync(path.join(this.options.pluginDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')

                await this.setupManifest();
            }
        }
    }

    private async setupProject(configuration: Configuration){

        try{
            const {project, workspace} = await Project.find(configuration, this.yarnPath)

            this.yarnWorkspace = workspace;

            this.yarnProject = project;

        // await project.restoreInstallState({ restoreResolutions: false })
        
        }catch(err: any){
            console.log(err.message)
            if(err.message.indexOf('The nearest package directory') > -1){
                writeFileSync(path.join(this.options.pluginDir, 'yarn.lock'), '', 'utf8');

                await new Promise((resolve) => setTimeout(async () => {
                    await this.setupProject(configuration)
                    resolve(true);
                }, 1000))
            }
        }
    }

    listDrivers(){
        return Array.from(this.yarnManifest?.dependencies.entries() || []).map((x) => x[1].scope + x[1].name)
    }

    hasDriver(pkg: string, range?: string){
       return Array.from(this.yarnManifest?.dependencies.entries() || []).findIndex((a) => {
            return `${a[1].scope ? `@${a[1].scope}/` : ''}${a[1].name}` == pkg && (range == undefined || range == a[1].range)
       }) > -1
    }

    async ensureDrivers(drivers: {pkg: string, range?: string}[]){
        await Promise.all(drivers.map(async (driver) => {
            if(driver.pkg && !this.hasDriver(driver.pkg, driver.range)){
                console.log("Installing " + driver.pkg)
                await this.installDriver(driver.pkg, driver.range)
                console.log("Installed " + driver.pkg + "!")
            }

        }))
    }

    async installDriver(pkg: string, range?: string){
        if(!this.yarnConfiguration) throw new Error('No yarnConfiguration found');

        const report = await LightReport.start({
            configuration: this.yarnConfiguration,
            stdout: process.stdout
        }, async (report) => {

            if(!this.yarnCache) throw new Error('No yarnCache found');

            const pkg_parts = pkg.split('/');
            const ident = makeIdent(pkg_parts.length > 1 ? pkg_parts[0].replace('@', '') : null, pkg_parts.length > 1 ? pkg_parts[1] : pkg_parts[0]);
            const descriptor = makeDescriptor(ident, range || 'latest');

            this.yarnManifest?.dependencies.set(ident.identHash, descriptor);

            let manifest = this.yarnManifest?.exportTo({});

            writeFileSync(path.join(this.options.pluginDir, 'package.json'), JSON.stringify(manifest, null, 2), 'utf8')

            await this.yarnProject?.restoreInstallState({ restoreResolutions: false })

            await this.yarnProject?.install({
                cache: this.yarnCache,
                report
            })

        })

        if(report.hasErrors()){
            const pkg_parts = pkg.split('/');
            const ident = makeIdent(pkg_parts.length > 1 ? pkg_parts[0].replace('@', '') : null, pkg_parts.length > 1 ? pkg_parts[1] : pkg_parts[0]);

            this.yarnManifest?.dependencies.delete(ident.identHash);
            let manifest = this.yarnManifest?.exportTo({});
            writeFileSync(path.join(this.options.pluginDir, 'package.json'), JSON.stringify(manifest, null, 2), 'utf8')

            throw new Error(`Yarn failed`)
        }
    }

    async uninstallDriver(pkg: string){
        if(!this.yarnConfiguration) throw new Error('No yarnConfiguration found');

        let backupValue: Descriptor | undefined;
        
        const report = await LightReport.start({
            configuration: this.yarnConfiguration,
            stdout: process.stdout
        }, async (report) => {

            if(!this.yarnCache) throw new Error('No yarnCache found');

            const pkg_parts = pkg.split('/');
            const ident = makeIdent(pkg_parts.length > 1 ? pkg_parts[0].replace('@', '') : null, pkg_parts.length > 1 ? pkg_parts[1] : pkg_parts[0]);

            backupValue = this.yarnManifest?.dependencies.get(ident.identHash);

            this.yarnManifest?.dependencies.delete(ident.identHash);

            writeFileSync(path.join(this.options.pluginDir, 'package.json'), JSON.stringify(this.yarnManifest?.exportTo({}), null, 2), 'utf8')

            await this.yarnProject?.install({
                cache: this.yarnCache,
                report,
                persistProject: true
            })
        })
        if(report.hasErrors()){
            if(!backupValue) throw new Error('Backup value not found');

            const pkg_parts = pkg.split('/');
            const ident = makeIdent(pkg_parts.length > 1 ? pkg_parts[0].replace('@', '') : null, pkg_parts.length > 1 ? pkg_parts[1] : pkg_parts[0]);

            this.yarnManifest?.dependencies.set(ident.identHash, backupValue);
            writeFileSync(path.join(this.options.pluginDir, 'package.json'), JSON.stringify(this.yarnManifest?.exportTo({}), null, 2), 'utf8')

        }
    }

    getDriver(pkg: string){
        return this.drivers[pkg];
    }

    async loadDriver(pkg: string, configuration: any){

        if(this.drivers[pkg] && isEqual(this.driverConfigurations[pkg], configuration)) {
            return this.drivers[pkg];
        }
        
        const driver = await Driver({
            driver: path.join(this.options.pluginDir, 'node_modules/', pkg),
            configuration
        });

        this.driverConfigurations[pkg] = configuration;
        this.drivers[pkg] = driver //as unknown as BaseCommandDriver

        try{
            await this.drivers[pkg].start()
        }catch(e){
            console.log("Error starting driver", pkg, e);
        }
        return this.drivers[pkg]
    }

    async unloadDriver(pkg: string){
        this.drivers[pkg].stop?.();

        delete this.drivers[pkg]
    }


}

export const Driver = async (options: {driver: string, configuration: any}) => {

    const worker : Worker = new Worker('./worker');

    const driver = await spawn<{
        ready: () => boolean,
        start: () => void,
        stop: () => void,
        read: (tag: {name: string, alias: string}) => any,
        readMany: (tags: {name: string, alias: string}[]) => any,
        write: (tag: {name: string, value: string}) => any,
        writeMany: (tags: {name: string, value: string}[]) => any,
        subscribe: (tags: {name: string, alias: string}[]) => Observable<{[key: string]: any}>,
        load_driver: (driver: string, configuration: any) => BaseCommandDriver
    }>(worker);

    let instance = await driver.load_driver(options.driver, options.configuration)

    return driver
}
