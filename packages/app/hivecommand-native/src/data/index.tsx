import React, { useEffect, useState } from "react";
import { writeTextFile, readTextFile, removeFile, BaseDirectory } from "@tauri-apps/api/fs";
import { GlobalState, StateUpdateFn } from "../views/setup/context";

export const DataContext = React.createContext<{
    isReady?: boolean,
    authState?: (AuthState & {isAuthed: () => boolean}),
    globalState?: GlobalState;
    setAuthState?: (key: string, value: any) => void;
    updateAuthState?: (key: string, value: any) => void;
    updateGlobalState?: StateUpdateFn
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
    configProvided?: boolean;
    opcuaServer?: string;
    opcuaProvisioned?: boolean;
}

export const DataProvider = (props: any) => {

    // const layoutSchema = [];
    // const dataSchema = [];

    const [ isReady, setIsReady ] = useState(false);

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
        // removeFile(props.storagePath, {dir: BaseDirectory.App})

        readBlob().then(({globalState, authState}) => {
            setGlobalState(globalState)
            setAuthState(authState)

            setIsReady(true);
        });

    }, [])

    const updateGlobalState : StateUpdateFn = async (stateUpdate) => {
        // console.log(key)

        
        setGlobalState(stateUpdate);

        writeBlob()
    }

    const updateAuthState = (key: any, value: any) => {
        setAuthState((authState) => ({...authState, [key]: value}))
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
            isReady,
            authState: {
                ...authState,
                isAuthed: () => {
                    console.log({authState});
                    return authState.discoveryServer != null && authState.provisionCode != undefined && authState.authToken != undefined && authState.opcuaServer != undefined && authState.opcuaProvisioned == true && authState.configProvided == true
                }
            },
            updateAuthState: (key, value) => {console.log("update auth state", {key ,value}); updateAuthState(key, value)},
            updateGlobalState,
            setAuthState: (key, value) => { console.log("set auth state", {key, value});  setAuthState((authState) => ({...authState, [key]: value }) )},
            globalState
        }}>
            {props.children}
        </DataContext.Provider>
    );
}