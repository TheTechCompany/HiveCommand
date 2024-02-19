import { AlarmRegister, AlarmItem } from "@hive-command/alarm-engine";
import { nanoid } from "nanoid";

export class LocalRegister implements AlarmRegister {

    alarms : AlarmItem[];

    constructor(){
        this.alarms = [];
    }

   async getLast(message: string, causeId: string, level?: string | undefined) {
        return this.alarms.find((a) => a.message == message && a.causeId == causeId && a.level == level)
    }

    async create(message: string, causeId: string, level?: string | undefined) {
        const item = {
            id: nanoid(),
            message,
            causeId,
            level
        }
        this.alarms.push(item)
        return item;
    }

}