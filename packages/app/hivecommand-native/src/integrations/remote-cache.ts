import { RemoteComponentCache, RemoteComponent } from "@hive-command/command-surface";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

export const useRemoteCache = (confPath: string) => {

    const [ packs, _setPacks ] = useState<{[key: string]: RemoteComponent[]}>({});

    // const

    useEffect(() => {
        readTextFile(confPath, { dir: BaseDirectory.App }).then((cacheData) => {
            try{
                let data = JSON.parse(cacheData);
                _setPacks(data);
            }catch(e){
                console.error('RemoteCache', e)
            }
        })
    }, []);
    
    const setPacks = (packs: {[key: string]: RemoteComponent[]}) => {
        _setPacks(packs)

        writeTextFile(confPath, JSON.stringify(packs), {dir: BaseDirectory.App})
    }

    return [packs, setPacks]
}