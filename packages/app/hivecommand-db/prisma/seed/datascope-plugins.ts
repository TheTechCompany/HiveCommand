import { PrismaClient } from "@prisma/client";
import {nanoid} from 'nanoid'

export default async (prisma: PrismaClient) => {

    //Ethernet/IP

    await prisma.dataScopePlugin.create({
        data: {
            id: nanoid(),
            name: 'Ethernet/IP',
            module: '@hive-command/drivers-ethernet-ip',
            configuration: {
                host: 'String', 
                slot: 'Number',
                rpi: 'Number'
            }
        }
    })


    //OCPUA

    await prisma.dataScopePlugin.create({
        data: {
            id: nanoid(),
            name: 'Ethernet/IP',
            module: '@hive-command/drivers-opcua',
            configuration: {
                host: 'String', 
                port: 'Number'
            }
        }
    })
}