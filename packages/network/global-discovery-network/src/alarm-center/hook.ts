import { transpile, ModuleKind, JsxEmit } from 'typescript'

export enum ALARM_LEVEL {
    CRITICAL,
    FAULT,
    WARNING
}

export const makeHook = (
    script: string, 
    raiseAlarm: (message: string, level?: ALARM_LEVEL, sticky?: boolean) => Promise<boolean>,
    sendNotification: (message: string, pathway?: string) => void
) : {
    handler?: (tags: any, typedTags: any) => void
} => {
    const jsCode = transpile(`
    
        ${script}
    
    `, { module: ModuleKind.CommonJS, esModuleInterop: true, jsx: JsxEmit.React })

    const func = new Function(
        "module",
        "exports",
        "raiseAlarm",
        "sendNotification",
        // "require",
        jsCode);


    const exports : {handler?: (tags: any, typedTags: any) => void} = {};
    const module = {exports};

    func(module, exports, raiseAlarm, sendNotification) //, microRequire(`${parent ? parent : ''}${name}`))

    return exports
}

// const a = makeHook(`
// export const handler = (tags: Tags) => {
//     console.log("a")   
//     raiseAlarm(tags.asd)
// }
// `, async (message, level, sticky) => {

//     return false;
// }, () => {

// })

// console.log(a.handler?.({}, {}));