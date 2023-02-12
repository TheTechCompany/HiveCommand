import { MQTTHub } from "../src";
import { DataType } from 'node-opcua'
import { PrismaClient } from '@hive-command/data'

const prisma = new PrismaClient();

(async () => {
    const hub = new MQTTHub({
        host: process.env.IOT_HOST || '',
        user: process.env.IOT_USER,
        pass: process.env.IOT_PASS,
        exchange: 'device_values',
        onMessage: async ({messageContent, userId, routingKey}) => {

            let dt = DataType[messageContent?.dataType]
            let val = messageContent?.value;
            console.log({dt, val: val, DataType: messageContent?.dataType})

            const device = await prisma.device.findFirst({where: {network_name: userId}})
            //Log into timeseries with routingKey describing opc tree state and messageContent containing the value

            if(!device || !routingKey || !messageContent) throw new Error("No routingKey or no device or no messageContent");

            if(typeof(messageContent.value) == "object"){
                await Promise.all(Object.keys(messageContent.value).map(async (valueKey) => {
                    await prisma.deviceValue.create({
                        data: {
                            deviceId: device.id,
                            placeholder: routingKey,
                            key: valueKey,
                            value: `${messageContent?.value[valueKey]}`
                        }
                    })
                }))
            }else{
                await prisma.deviceValue.create({
                    data: {
                        deviceId: device.id,
                        placeholder: routingKey,
                        // key: routingKey,
                        value: `${messageContent?.value}`,
                    }
                })
            }
        }
    })
    
    await hub.setup()

    console.log("Connected")

    await hub.subscribe()

    console.log("Subscribed");
})()
