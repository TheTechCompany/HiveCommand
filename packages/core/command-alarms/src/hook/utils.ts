import { transpile, ModuleKind, JsxEmit } from 'typescript'
import { HookInstance } from './types';

export enum ALARM_LEVEL {
    CRITICAL,
    FAULT,
    WARNING
}

export const makeNotification = (
    script: string
) => {

    const jsCode = transpile(script, {module: ModuleKind.CommonJS, esModuleInterop: true, jsx: JsxEmit.React})

    const func = new Function(
        "module",
        "exports",
        jsCode
    );

    const exports : {sendNotification?: (message: string) => void} = {};
    const module = {exports};

    func(module, exports) //, microRequire(`${parent ? parent : ''}${name}`))

    return exports

}

export const makeHook = (
    script: string, 
    pathways: {name: string}[],
    raiseAlarm: (message: string, level?: ALARM_LEVEL, sticky?: boolean) => Promise<boolean>,
    sendNotification: (message: string, pathway?: string) => void
) : {
    handler?: HookInstance
} => {
    const jsCode = transpile(`

    enum ALARM_LEVEL {
        CRITICAL = 'Critical',
        FAULT = 'Fault',
        WARNING = 'Warning'
    }

    enum PATHWAYS {
        ${pathways?.map((pathway) => `"${pathway.name}" = "${pathway?.name}"`).join(',\n')}
    }

        ${script}
    
    `, { module: ModuleKind.CommonJS, esModuleInterop: true, jsx: JsxEmit.React })

    const func = new Function(
        "module",
        "exports",
        "raiseAlarm",
        "sendNotification",
        // "require",
        jsCode);


    const exports : {handler?: HookInstance} = {};
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