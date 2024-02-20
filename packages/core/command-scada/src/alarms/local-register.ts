import { AlarmRegister, AlarmItem } from "@hive-command/alarm-engine";
import { nanoid } from "nanoid";

export class LocalRegister implements AlarmRegister {

    alarms : AlarmItem[];

    constructor(){
        this.alarms = [];
    }

   async getLast(message: string, causeId: string, level?: string | undefined) {
        return this.alarms?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).find((a) => a.message == message && a.causeId == causeId && a.level == level)
    }

    async getAll(): Promise<AlarmItem[] | undefined> {
        
    }

    async create(message: string, causeId: string, level?: string | undefined) {
        const item = {
            id: nanoid(),
            message,
            causeId,
            level,
            createdAt: new Date(),
            ack: false
        }
        this.alarms.push(item)
        return item;
    }

    acknowledge(id: string): boolean {
        let ix = this.alarms?.findIndex((a) => a.id == id);
        if(ix > -1){
            this.alarms[ix].ack = true;

            return true;
        }
        return false;
    }

}