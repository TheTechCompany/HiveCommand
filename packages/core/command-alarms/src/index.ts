/*
    Alarm Center 

    - Hook new events and process for alarm keys + values
    - Submit start to new hook providing SMS + Comms out
*/

import { ALARM_LEVEL, makeHook, makeNotification } from "./hook/utils";
import { nanoid } from 'nanoid'
import { Hook } from "./hook";
import { AlarmRegister } from "./alarm";
import { Alarm, AlarmPathway } from "@hive-command/interface-types";
import { HookCleanup } from "./hook/types";

export * from './alarm'
export * from './utils/format';

export class AlarmCenter {

    private register: AlarmRegister;

    private cleanupHooks : (HookCleanup | undefined)[] = [];

    constructor(register: AlarmRegister){
        this.register = register;
    }

    //Only works for local command-scada currently
    async hook (alarms: Alarm[], alarmPathways: AlarmPathway[], lastValues: any, values: any, typedValues: any) {

        //Cleanup from last hook call
        await Promise.all(this.cleanupHooks.map((cleanup) => {
            cleanup?.();
        }));
        
        //Setup new bulk hooks
        const hookInst = new Hook(this.register, alarms, alarmPathways);

        //Run hook and store alarm post processing function
        this.cleanupHooks = await hookInst.run(lastValues, values, typedValues)

    }   
}



