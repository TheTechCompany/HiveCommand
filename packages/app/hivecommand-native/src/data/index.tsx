import React, { useEffect, useState } from "react";
import { writeTextFile, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";

export const DataContext = React.createContext<{
    authState?: AuthState & {isAuthed: () => boolean},
    globalState?: any;
    updateAuthState?: (key: string, value: any) => void;
    updateGlobalState?: (key: string, updateFn: any) => void;
}>({});

/*
    Wake up
    read local storage for state

    authorize and start storing data
*/

export interface AuthState {
    discoveryServer?: string;
    provisionCode?: string;
    authToken?: string;
    opcuaServer?: string;
    opcuaProvisioned?: boolean;
}

export const DataProvider = (props: any) => {

    // const layoutSchema = [];
    // const dataSchema = [];

    const [ authState, setAuthState ] = useState<AuthState>({
        discoveryServer: 'https://discovery.hexhive.io'
    });

    const [ globalState, setGlobalState ] = useState<any>({});

    const STORAGE = props.storagePath;

    const readBlob = async ()  : Promise<{globalState: any, authState: AuthState}> => {
        try{
            const stringBlob = await readTextFile(STORAGE,  {dir: BaseDirectory.App})
            console.log({stringBlob})
            return JSON.parse(stringBlob)
        }catch(e){
            return {globalState: {}, authState: {...authState}}
        }
    }

    const writeBlob = async () => {
        let blob = {
            globalState,
            authState
        }
        await writeTextFile(STORAGE, JSON.stringify(blob), {dir: BaseDirectory.App})
    }

    useEffect(() => {
        
        readBlob().then(({globalState, authState}) => {
            setGlobalState(globalState)
            setAuthState(authState)
        });

    }, [])

    const updateGlobalState = async (key: string, value: any) => {
        console.log(key)
        setGlobalState((state: any) => ({
            ...state,
            [key]: value
        }));

        writeBlob()
    }

    const updateAuthState = (key: any, value: any) => {
        setAuthState({...authState, [key]: value})
        writeBlob();
    }


    const startSession = () => {
        //Check 
        //Write auth info down safely
        //Write blob info down
    }

    const endSession = () => {

    }
    
    return (
        <DataContext.Provider value={{
            ...props.value,
            authState: {
                ...authState,
                isAuthed: () => {
                    return authState.discoveryServer && authState.provisionCode && authState.authToken && authState.opcuaServer && authState.opcuaProvisioned
                }
            },
            updateAuthState,
            updateGlobalState,
            globalState
        }}>
            {props.children}
        </DataContext.Provider>
    );
}