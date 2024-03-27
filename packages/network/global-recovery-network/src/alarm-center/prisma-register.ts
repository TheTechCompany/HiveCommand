import { AlarmItem, AlarmRegister } from "@hive-command/alarm-engine";
import { PrismaClient } from "@hive-command/data";
import { nanoid } from "nanoid";

export class PrismaRegister implements AlarmRegister {

    private prisma : PrismaClient;

    private deviceId : string;

    constructor(deviceId: string, prisma : PrismaClient){
        this.deviceId = deviceId;
        this.prisma = prisma;
    }

    async getLast(message: string, causeId: string, level?: string | undefined) {
        return await this.prisma.alarm.findFirst({
            where: {
                deviceId: this.deviceId,
                causeId,
                severity: level,
                message,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })  || undefined
    }

    async create(message: string, causeId: string, level?: string | undefined) {
        return await this.prisma.alarm.create({
            data: {
                id: nanoid(),
                deviceId: this.deviceId,
                message,
                causeId,
                severity: level
            }
        })
    }
}