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

export * from './alarm'
export * from './utils/format';

export class AlarmCenter {

    private register: AlarmRegister;

    constructor(register: AlarmRegister){
        this.register = register;
    }

    async hook (alarms: Alarm[], alarmPathways: AlarmPathway[], values: any, typedValues: any) {
        //Look up device and routing key in alarms list
        
        console.log({values, typedValues})

        const hookInst = new Hook(this.register, alarms, alarmPathways);


        hookInst.run(values, typedValues)
        
        //Check whether it qualifies as alarm

        //Run alarm post processing function
    }   
}



