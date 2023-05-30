import { expose } from 'threads/worker';
import { BaseCommandDriver } from '@hive-command/drivers-base';

let Driver: any;
let instance: BaseCommandDriver;


expose({
    start: async () => {
        await instance.start()
        // process.exit()
    },
    read: async (tag: {name: string, alias: string}) => {
        return await instance.read(tag)
    },
    write: async (tag: string, value: any) => {
        return await instance.write(tag, value);
    },
    load_driver: (driver: string, configuration: any) => {
        try {
            const driver_req = require(driver)
            Driver = driver_req.default ? driver_req.default : driver_req;
        } catch (e) {
            console.error(e)
            throw new Error('Failed to load driver')
        }
        
        try {
            instance = new Driver({configuration});
            return instance;
        } catch (e) {
            console.error(e)
            throw new Error('Failed to instantiate driver');
          
        }
    }

})
