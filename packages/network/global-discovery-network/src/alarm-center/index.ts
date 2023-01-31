/*
    Alarm Center 

    - Hook new events and process for alarm keys + values
    - Submit start to new hook providing SMS + Comms out
*/

import { MQTTHubMessage } from "@hive-command/opcua-mqtt-hub";

export class AlarmCenter {

    constructor(){

    }

    hook (msg: MQTTHubMessage) {
        //Look up device and routing key in alarms list

        //Check whether it qualifies as alarm

        //Run alarm post processing function
    }   
}

