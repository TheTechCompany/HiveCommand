import { nanoid } from "nanoid";
import { Channel } from 'amqplib'
import { PrismaClient } from "@hive-command/data";

export default (prisma: PrismaClient, channel: Channel) => {

    const typeDefs = `
        type Mutation {
            changeMode(deviceId: String, mode: String): Boolean
            changeState(deviceId: String, state: String): Boolean
            
            performDeviceAction(deviceId: String, deviceName: String, action: String): Boolean
            changeDeviceValue(deviceId: String, deviceName: String, key: String, value: String): Boolean
            
            changeDeviceMode(deviceId: String, deviceName: String, mode: String): Boolean
            requestFlow(deviceId: String, actionId: String): Boolean
        }
    `

    const resolvers = {
        Mutation: {
			requestFlow: async (root: any, args: any, context: any) => {
				// console.log(args)
				// const waitingId = nanoid()
				// const device = await session.writeTransaction(async (tx) => {

				// 	const res = await tx.run(`
				// 		MATCH (device:CommandDevice {id: $id})
				// 		RETURN device{ .* }
				// 	`, {
				// 		id: args.deviceId,
				// 		actionId: args.actionId
				// 	})

				// 	return res.records?.[0]?.get(0)
				
				// })

				// 	let actionRequest = {
				// 		waitingId: waitingId,
				// 		address: `opc.tcp://${device.network_name}.hexhive.io:8440`,
				// 		deviceId: args.deviceId,
				// 		flow: args.actionId,
				// 		authorizedBy: context.jwt?.name
				// 	}
				// 	return await channel.sendToQueue(`COMMAND:FLOW:PRIORITIZE`, Buffer.from(JSON.stringify(actionRequest)))
			
			},
			performDeviceAction: async (root: any, args: any, context: any) => {
				const device = await prisma.device.findFirst({
					where: {
						id: args.deviceId,
						organisation: context?.jwt?.organisation
					},
					include: {
						activeProgram: {
							include: {
								// devices: {
								// 	// where: {tag: args.deviceName},
								// 	include: {
								// 		type: {
								// 			include: {
								// 				actions: true,
								// 			}
								// 		}
								// 	}
								// }
							}
						}
					}
				})

				// const actions = device?.activeProgram?.devices?.find((a) => `${a.type?.tagPrefix || ''}${a.tag}` == args.deviceName)?.type?.actions

				// let action = actions?.find((a: any) => a.key == args.action)

				// if(action && device){
				// 	let actionRequest = {
				// 		address: `opc.tcp://${device?.network_name}:8440`,
				// 		deviceId: args.deviceId,
				// 		deviceName: args.deviceName,
				// 		action: action.key,
				// 		authorizedBy: context.jwt?.name
				// 	}

				// 	// channel.
				// 	return await channel.sendToQueue(`COMMAND:DEVICE:CONTROL`, Buffer.from(JSON.stringify(actionRequest)))
				// }else{
				// 	return new Error("No device control found")
				// }
				
			},
			changeMode: async (root: any, args: {
				deviceId: string,
				mode: string
			}, context: any) => {

				const device = await prisma.device.findFirst({
					where: {id: args.deviceId, organisation: context?.jwt?.organisation}
				})

				if(!device) return new Error("No device found")

				let actionRequest = {
					address: `opc.tcp://${device.network_name}:8440`,
					deviceId: args.deviceId,
					mode: args.mode,
					authorizedBy: context.jwt?.name
				}

				return await channel.sendToQueue(`COMMAND:MODE`, Buffer.from(JSON.stringify(actionRequest)))
				// return await prisma.device.update({
				// 	where: {id: args.deviceId},
				// 	data: {
				// 		mode: args.mode
				// 	}
				// })


				// const device = await session.readTransaction(async (tx) => {

				// 	const res = await tx.run(`
				// 		MATCH (device:CommandDevice {id: $id})
				// 		RETURN device{.*}
				// 	`, {
				// 		id: args.deviceId
				// 	})
				// 	return res.records?.[0]?.get(0)
				
				// })

				
				// await session.writeTransaction(async (tx) => {
				// 	await tx.run(`
				// 		MATCH (device:CommandDevice {id: $id})
				// 		SET device.operatingMode = $mode
				// 		RETURN device
				// 	`, {
				// 		id: args.deviceId,
				// 		mode: args.mode
				// 	})
				// })

				// return await channel.sendToQueue(`COMMAND:MODE`, Buffer.from(JSON.stringify(actionRequest)))
			},
			changeState: async (root: any, args: {deviceId: string, state: string}, context: any) => {
				if(args.state != "on" && args.state != "off" && args.state != "standby"){
					return new Error("Invalid state")
				} 

				const device = await prisma.device.findFirst({
					where: {
						id: args.deviceId,
						organisation: context?.jwt?.organisation
					}
				})

				if(!device) return new Error("No device found")
				// const device = await session.readTransaction(async (tx) => {

				// 	const res = await tx.run(`
				// 		MATCH (device:CommandDevice {id: $id})
				// 		RETURN device{.*}
				// 	`, {
				// 		id: args.deviceId
				// 	})
				// 	return res.records?.[0]?.get(0)
				// })

				let actionRequest = {
					address: `opc.tcp://${device.network_name}:8440`,
					deviceId: args.deviceId,
					state: args.state,
					authorizedBy: context.jwt?.name
				}

				// await session.writeTransaction(async (tx) => {
				// 	await tx.run(`
				// 		MATCH (device:CommandDevice {id: $id})
				// 		SET device.operatingState = $state
				// 		RETURN device
				// 	`, {
				// 		id: args.deviceId,
				// 		state: args.state
				// 	})
				// })

				return await channel.sendToQueue(`COMMAND:STATE`, Buffer.from(JSON.stringify(actionRequest)))

			},
			changeDeviceMode: async (root: any, args: {
				deviceId: string,
				deviceName: string,
				mode: string
			}, context: any) => {
				// const device = await session.readTransaction(async (tx) => {

				// 	return await getDeviceActions(tx, args.deviceId, args.deviceName)
				
				// })

				// let actionRequest = {
				// 	address: `opc.tcp://${device.network_name}.hexhive.io:8440`,
				// 	deviceId: args.deviceId,
				// 	deviceName: args.deviceName,
				// 	mode: args.mode,
				// 	authorizedBy: context.jwt?.name
				// }

				// return await channel.sendToQueue(`COMMAND:DEVICE:MODE`, Buffer.from(JSON.stringify(actionRequest)))
			},
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

				// if(!device) return new Error("No device found")

				// let stateChange = {
				// 	address: `opc.tcp://${device?.network_name}:8440`,
				// 	busPath: `/Objects/1:Devices/1:${args.deviceName}/1:${args.key}`,
				// 	dataType,
				// 	value: args.value
				// }

				// return await channel.sendToQueue(`COMMAND:DEVICE:VALUE`, Buffer.from(JSON.stringify(stateChange)))

			}
		}

    };

    return {typeDefs, resolvers}
}