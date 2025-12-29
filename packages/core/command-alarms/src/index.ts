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

    private cleanupHooks? : (HookCleanup | undefined)[] = [];
    private alarmHook : Hook | undefined;

    constructor(register: AlarmRegister, alarms?: Alarm[], alarmPathways?: AlarmPathway[]){
        this.register = register;
        this.alarmHook = new Hook(this.register, alarms || [], alarmPathways || []);
    }

    //Only works for local command-scada currently
    async hook (lastValues: any, values: any, typedValues: any) {

        //Cleanup from last hook call
        await Promise.all((this.cleanupHooks || []).map((cleanup) => {
            cleanup?.();
        }));
        
        // //Setup new bulk hooks
        // const hookInst = new Hook(this.register, alarms, alarmPathways);

        //Run hook and store alarm post processing function
        this.cleanupHooks = await this.alarmHook?.run(lastValues, values, typedValues)

    }   
}



