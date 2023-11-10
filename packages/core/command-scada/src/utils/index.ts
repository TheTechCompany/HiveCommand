export const formatValue = (value: any, type: string) => {
    switch(type){
        case 'String':
            return value.toString()
        case 'Number':
            return parseFloat(value);
        default:
            return value;
    }
}


export const appData = () => {
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
}