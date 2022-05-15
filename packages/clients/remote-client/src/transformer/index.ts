import vm from 'vm';

export const transformValue = (func: string, value: any) => {
    return vm.runInNewContext(func, {
        value
    })
}