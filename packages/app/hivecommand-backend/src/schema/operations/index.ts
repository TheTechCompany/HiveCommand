import { nanoid } from "nanoid";
import { MQTTClient, MQTTPublisher } from '@hive-command/amqp-client'
import { PrismaClient } from "@hive-command/data";

export default (prisma: PrismaClient, deviceChannel?: MQTTPublisher) => {

    const typeDefs = `
        type Mutation {
            changeDeviceValue(deviceId: String, deviceName: String, key: String, value: String): Boolean
        }
    `

    const resolvers = {
        Mutation: {
			
			changeDeviceValue: async (root: any, args: {
				deviceId: string, 
				deviceName: string, 
				key: string, 
				value: string
			}, context: any) => {
				
				const device = await prisma.device.findFirst({
					where: {
						id: args.deviceId,
						organisation: context?.jwt?.organisation
					}
				})

				const program = await prisma.program.findFirst({
					where: {
						usedBy: {
							some: {
								id: args.deviceId
							}
						}
					},
				})
		
				// const dataType = program?.devices?.find((a) => `${a.type?.tagPrefix ? a.type?.tagPrefix : ''}${a.tag}` == args.deviceName)?.type?.state?.find((a) => a.key == args.key)?.type;

				if(!device) return new Error("No device found")

				// let stateChange = {
				// 	address: `opc.tcp://${device?.network_name}:8440`,
				// 	busPath: `/Objects/1:Devices/1:${args.deviceName}/1:${args.key}`,
				// 	dataType,
				// 	value: args.value
				// }

				// return await channel.sendToQueue(`COMMAND:DEVICE:VALUE`, Buffer.from(JSON.stringify(stateChange)))
				// await deviceChannel.channel?.assertQueue(`device:${device?.network_name}`)

				await deviceChannel?.publish(device.network_name, `${args.deviceName}${args.key ? `/${args.key}` : ''}`, args.value)
				// .channel?.sendToQueue(`device:${device?.network_name}`, Buffer.from( JSON.stringify({ key: `${args.deviceName}${args.key ? `.${args.key}` : ''}`, value: args.value }) ))
				
				return true;
			}
		}

    };

    return {typeDefs, resolvers}
}