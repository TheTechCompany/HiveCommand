import { nanoid } from "nanoid";
import { ALARM_LEVEL, makeHook, makeNotification } from "./utils";
import { AlarmRegister } from "../alarm";
import { Alarm, AlarmPathway } from "@hive-command/interface-types";
import { HookInstance } from "./types";

export class Hook {

    private compiledAlarms: ({handler?: HookInstance| undefined} | undefined)[];
    private alarms : Alarm[];
    private alarmPathways: AlarmPathway[];

    private register: AlarmRegister;

    constructor(register: AlarmRegister, alarms: Alarm[], alarmPathways: AlarmPathway[]){
        this.register = register;
        this.alarms = alarms;
        this.alarmPathways = alarmPathways;


        this.compiledAlarms = this.alarms.map((x) => {
            // const runtimeId = nanoid();

            try{
                const hook = makeHook(
                    x.script || '', 
                    this.alarmPathways, 
                    async (message: string, level?: ALARM_LEVEL, sticky?: boolean) => {
                        return  await this.raiseAlarm(x.id, message, level, sticky);
                    }, 
                    async (message: string, pathway?: string) => {
                        return await this.sendNotification(message, pathway);
                    })
                return hook;
                
            }catch(err){
                console.error(`Error making hook: `, err)
            }

        })
    }

    async run(lastValues: any, values: any, typedValues: {[key: string]: {[key: string]: any}}){

        return await Promise.all(this.compiledAlarms.map(async (alm) => {
            try{
                return await alm?.handler?.(lastValues, values, typedValues);
            }catch(err){
                console.error(`Error running hook: `, err)
            }
        }));
    }


    private async raiseAlarm(causeId: string, message: string, level?: ALARM_LEVEL, sticky?: boolean) : Promise<boolean>{

        let shouldAlarm = true;

        if(sticky){
            const lastAlarm = await this.register.getLast?.(message, causeId, level ? ALARM_LEVEL[level] : undefined);

            // const lastAlarm = await this.prisma?.alarm.findFirst({
            //     where: {
            //         deviceId: deviceId,
            //         message,
            //         severity:level ? ALARM_LEVEL[level]: undefined
            //     }
            // })

            if(lastAlarm && !lastAlarm?.ack){
                shouldAlarm = false;
            }
        }

        console.log({shouldAlarm});

        if(shouldAlarm){
            await this.register.create?.(message, causeId, level ? ALARM_LEVEL[level] : undefined)
            // await this.prisma?.alarm.create({
            //     data: {
            //         id: nanoid(),
            //         message,
            //         severity: level ? ALARM_LEVEL[level] : undefined,
            //         device: {
            //             connect: {id: deviceId}
            //         },
            //         cause: {
            //             connect: {
            //                 id: causeId
            //             }
            //         }
            //     }
            // })
        }else{
            return false;
        }


        return true;
    }

    private async sendNotification(message: string, pathway?: string){
        const pathwayObj = this.alarmPathways?.find((a: any) => a.name == pathway)?.script;

        if(!pathwayObj) return null;
            
        const { sendNotification } = makeNotification(pathwayObj)
        console.log("Sending notification")
        return await sendNotification?.(message)
    }



}