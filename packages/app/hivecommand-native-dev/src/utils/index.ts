import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs'

const APP_CONF = 'app.conf';

//Get settings blob or provide fallback
export const getSettingsBlob = async () => {
    let settingsBlob: any = await readTextFile(APP_CONF, {dir: BaseDirectory.App});

    try{
        settingsBlob = JSON.parse(settingsBlob || '{}')
    }catch(e){ 
        settingsBlob = {};
    }
    return settingsBlob;
}

export const setSettingsBlob = async (blob: any) => {
    await writeTextFile(APP_CONF, JSON.stringify(blob), {dir: BaseDirectory.App});
}

//Pulls settings blob, updates key and optionally uses a function as value for deep updates
export const updateSettingsKey = async (key: string, value: ((prevValue: any) => any) | any) => {
    let settingsBlob = await getSettingsBlob();

    let newValue : any;
    if(value instanceof Function){
        newValue = value(settingsBlob[key])
    }else{
        newValue = value;
    }

    settingsBlob[key] = newValue;
    
    setSettingsBlob(settingsBlob)
}

//Read settings blob for key
export const readSettingsKey = async (key: string) => {
    let settingsBlob = await getSettingsBlob();

    return settingsBlob[key];
}