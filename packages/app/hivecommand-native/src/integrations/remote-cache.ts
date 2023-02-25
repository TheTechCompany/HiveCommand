import React from 'react';
import { RemoteComponentCache, RemoteComponent } from "@hive-command/remote-components";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

export const useRemoteCache = (confPath: string) => {

    const [ packs, _setPacks ] = useState<{[key: string]: RemoteComponent[]}>({});

    // const

    //
    const serialiser = (key: string, value: {name: string, component: Function}[] ) => {
        console.log("Serialise", {key, value})
        if(Array.isArray(value)){
            return value.map((item: any) => ({ item: item.name, component: item.component?.toString() }))
        }

        return value;
    }

    const deserialiser = (key: string, value: any) => {
        if(typeof(value) === 'string'){
            return JSON.parse(value, (key, value) => {
                if(key === 'component'){
                    return new Function("props", value)
                }
                return value;
            })
        }
        return value; 
    }

    useEffect(() => {
        readTextFile(confPath, { dir: BaseDirectory.App }).then((cacheData) => {
            try{
                let data = JSON.parse(cacheData);

                let parsedPacks = Object.keys(data).map((packId) => {
                    

                    return {key: packId, value: data[packId].map((x: any) => {

                        let fn = new Function("module", "exports", "React", x.component);

                        let exports : any = {};
                        let module = {exports};
                        
                        fn(module, exports, React);

                        let component = module.exports.default;
                        component.metadata = module.exports.metadata;

                        return { 
                            name: x.name, 
                            component: component
                        }
                    })}
                }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {});

                (window as any).parsed = parsedPacks;
                // _setPacks(parsedPacks);
            }catch(e){
                console.error('RemoteCache', e)
            }
        })
    }, []);
    
    const setPacks = (packs: {[key: string]: RemoteComponent[]}) => {
        _setPacks(packs)

        console.log("Set packs", {packs});

        const preprocessPacks =  Object.keys(packs).map((packId) => {

            return {
                key: packId, 
                value: packs[packId].map((x) => ({
                    name: x.name, 
                    component: `
                    module.exports.default = ${x.component.toString()};

                    module.exports.metadata = JSON.parse('${JSON.stringify( (x.component as any).metadata || {} )}');
                    `
                }))
            }

        }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

        
        const packString = JSON.stringify(preprocessPacks)

        console.log({packsString: packString, preprocessPacks});

        writeTextFile(confPath, packString, {dir: BaseDirectory.App})
    }

    return [packs, setPacks]
}