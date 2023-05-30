import { BaseCommandDriver } from '@hive-command/drivers-base';
import { Worker, spawn } from 'threads'

export const Driver = async (options: {driver: string, configuration: any}) => {

    const worker : Worker = new Worker('./worker');

    const driver = await spawn<{
        start: () => void,
        load_driver: (driver: string, configuration: any) => BaseCommandDriver
    }>(worker);

    let instance : BaseCommandDriver = await driver.load_driver(options.driver, options.configuration)

    return driver
}

(async () => {

    const driver = await Driver({
        driver: '../../../../drivers/command-ethernet-ip/dist/index.js',
        configuration: {
            ip: '192.168.108.33',
        }
    })

    
    console.log(await driver.start())
    
})()

// console.log(require.('worker_threads'))