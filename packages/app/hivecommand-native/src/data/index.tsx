import React, { useEffect, useState } from "react";
import { writeTextFile, readTextFile } from "@tauri-apps/api/fs";

export const DataContext = React.createContext({});

export const DataProvider = (props: any) => {

    // const layoutSchema = [];
    // const dataSchema = [];

    const [ globalState, setGlobalState ] = useState<any>({});

    const STORAGE = props.storagePath;

    const readBlob = async () => {
        const stringBlob = await readTextFile(STORAGE)
        return JSON.parse(stringBlob)
    }

    const writeBlob = async (blob: any) => {
        await writeTextFile(STORAGE, JSON.stringify(blob))
    }

    useEffect(() => {
        
        readBlob().then((data) => {
            setGlobalState(data)
        });

    }, [readBlob])

    const updateGlobalState = async (key: string, updateFn: any) => {
        await setGlobalState(async (data: any) => {
            let slice = data[key];
            const mutated = await updateFn(slice);
            data[key] = mutated;
            return data;
        });

        writeBlob(globalState)
    }

    return (
        <DataContext.Provider value={{
            ...props.value,
            updateGlobalState,
            globalState
        }}>
            {props.children}
        </DataContext.Provider>
    );
}