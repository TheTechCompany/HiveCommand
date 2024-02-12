/*
    Alarm Center 

    - Hook new events and process for alarm keys + values
    - Submit start to new hook providing SMS + Comms out
*/

import { MQTTHubMessage } from "@hive-command/amqp-hub";
import { ALARM_LEVEL, makeHook } from "./hook";
import { PrismaClient } from "@hive-command/data";
import { nanoid } from 'nanoid'

export interface Alarm {
    id: string;
    title: string | null;
    script: string | null;
}

export class AlarmCenter {

    private prisma?: PrismaClient;

    constructor(prisma?: PrismaClient){
        this.prisma = prisma;
    }

    async raiseAlarm(deviceId: string, causeId: string, message: string, level?: ALARM_LEVEL, sticky?: boolean) : Promise<boolean>{

        if(!this.prisma) throw new Error("No prisma client attached");
        
        let shouldAlarm = true;

        if(sticky){
            const lastAlarm = await this.prisma?.alarm.findFirst({
                where: {
                    deviceId: deviceId,
                    message,
                    severity:level ? ALARM_LEVEL[level]: undefined
                }
            })

            if(!lastAlarm?.ack){
                shouldAlarm = false;
            }
        }

        if(shouldAlarm){
            await this.prisma?.alarm.create({
                data: {
                    id: nanoid(),
                    message,
                    severity: level ? ALARM_LEVEL[level] : undefined,
                    device: {
                        connect: {id: deviceId}
                    },
                    cause: {
                        connect: {
                            id: causeId
                        }
                    }
                }
            })
        }else{
            return false;
        }


        return true;
    }

    async sendNotification(message: string, pathway?: string){

    }

    async hook (alarms: Alarm[], device: {id: string}, values: any, typedValues: any) {
        //Look up device and routing key in alarms list
        
        const compiledAlarms = alarms.map((x) => {

            const runtimeId = nanoid();
            console.time(`Compiling hook ${runtimeId}`);

            const hook = makeHook(x.script || '', async (message: string, level?: ALARM_LEVEL, sticky?: boolean) => {
                return  await this.raiseAlarm(device.id, x.id, message, level, sticky)
            }, this.sendNotification)

            console.timeEnd(`Compiling hook ${runtimeId}`);

            return hook;
        })

        await Promise.all(compiledAlarms.map(async (alm) => {
            await alm.handler?.(values, typedValues);
        }));

        //Check whether it qualifies as alarm

        //Run alarm post processing function
    }   
}



