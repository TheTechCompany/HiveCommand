import { existsSync, readFileSync } from "fs";
import path from "path";
import { Machine } from "."
import { BasePlugin } from "@hive-command/plugin-base"
import log from 'loglevel'

export class PluginBank {
	private machine: Machine;
	private plugins : BasePlugin[];

	private config: {
		plugins?: string[];
		ignorePlugins: string[]
	};

	constructor(opts: {machine: Machine, pluginDir: string}){
		this.machine = opts.machine;

		if(existsSync(path.join(opts.pluginDir, "plugins.json"))){
			const config = readFileSync(path.join(opts.pluginDir, 'plugins.json'), 'utf8');
			this.config = JSON.parse(config);
		}else{
			this.config = {
				ignorePlugins: []
			}
		}

		// console.log(this.config.plugins)

		let plugins = this.config.plugins?.map((plugin) => {
			const path = require.resolve(plugin, {
				paths: [opts.pluginDir]
			})
			// console.log(path)
			if(path) return require(path).default
		}).filter((a) => a != undefined);

		// const plugin_paths = require.resolve(opts.pluginDir)

		this.plugins = plugins?.map((x) => new x()) || [];

		log.info(`Loaded ${this.plugins.length} plugins`)
		// this.plugins = plugins?.map((plugin) => new plugin()) || []

		// console.log("Loaded Plugins", this.plugins);
		
	}

	getByTag(tag: string){
		return this.plugins.find((a) => a.TAG == tag)
	}

	async discoverEnvironment(){
		//Run discovery for all loaded plugins
		let environment = await Promise.all(this.plugins.filter((a) => (this.config.ignorePlugins || []).indexOf(a.TAG) < 0).map(async (plugin) => {
			const discovered = await plugin.discover()

			// console.log("Discovered Plugin Environment", discovered);
			return {
				plugin: plugin.TAG,
				discovered
			}
		}))
		return environment.reduce<{type: string, id: string, name: string}[]>((prev, curr) => {
			return prev.concat(curr.discovered.map((x: any) => ({...x, type: curr.plugin})))
		}, [])
	}


	async subscribeToBusSystem(env: {type: string, id: string, name: string}[]){
		await Promise.all(env.map(async (bus) => {
			let plugin = this.plugins.find((a) => a.TAG == bus.type)

			await plugin?.subscribe(bus.id)

			//TODO DEDUPE this
			plugin?.on('PORT:VALUE', (event) => {
				//TODO device(s) instead of device
				//TODO add to bus port value bank

				// console.log(event)

				let devices = this.machine.deviceMap.getDevicesByBusPort(event.bus, event.port)
				// console.log(device?.name, event.bus, event.port);
				if(!devices) return;


				devices.map((device) => {
					let cleanState = event.value;

					if(typeof(event.value) == "object"){

						cleanState = device.state?.filter((a) => event.value[a.foreignKey] != undefined ).reduce((prev, curr) => {
							let value = event.value[curr.foreignKey]

							if(curr.min && curr.max){
								if(value < curr.min) value = curr.min
								if(value > curr.max) value = curr.max

								value = ((value - curr.min) / (curr.max - curr.min)) * 100
							}

							return {
								...prev,
								[curr.key]: value //event.value[curr.foreignKey]
							}
						}, {})
	
					}
	
					this.machine?.state.update(device?.name, cleanState)
				})
				
				this.machine.busMap.set(event.bus, event.port, event.value);
				
				// this.valueBank.set(event.bus, event.port, event.value)
			})
		}))
	}
}