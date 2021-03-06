import { PrismaClient } from "@hive-command/data";
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

import devices from './devices';
import hmi from './hmi';
import program from './program';

import operations from './operations'
import { Channel } from 'amqplib';
import { Pool } from 'pg';

export default (prisma: PrismaClient, channel: Channel) => {

	const { typeDefs: deviceTypeDefs, resolvers: deviceResolvers } = devices(prisma, channel);
	const { typeDefs: programTypeDefs, resolvers: programResolvers } = program(prisma)
	const { typeDefs: hmiTypeDefs, resolvers: hmiResolvers } = hmi(prisma)

	const { typeDefs: operationTypeDefs, resolvers: operationResolvers } = operations(prisma, channel)

	const resolvers = mergeResolvers([
		deviceResolvers,
		programResolvers,
		hmiResolvers,
		operationResolvers
	]);

	/*
		type Query {
			commandDeviceValue(device: String, bus : String, port : String): [CommandDeviceValue]
			commandDeviceTimeseries(deviceId: String, device: String, valueKey: String, startDate: String): [CommandDeviceTimeseriesData]
			commandDeviceTimeseriesTotal(deviceId: String, device: String, valueKey: String, startDate: String, endDate: String): CommandDeviceTimeseriesTotal
		}

		type Mutation {
			changeMode(deviceId: String, mode: String): Boolean
			changeState(deviceId: String, state: String): Boolean
			
			performDeviceAction(deviceId: String, deviceName: String, action: String): Boolean
			changeDeviceValue(deviceId: String, deviceName: String, key: String, value: String): Boolean
			
			changeDeviceMode(deviceId: String, deviceName: String, mode: String): Boolean
			requestFlow(deviceId: String, actionId: String): Boolean
		}

	*/

	 const typeDefs = mergeTypeDefs([
		 `	
		type CommandKeyValue {
			id: ID 
			key: String
			value: String
		}
		`,
		operationTypeDefs,
		deviceTypeDefs,
		programTypeDefs,
		hmiTypeDefs
	 ])
	



	return {
		typeDefs,
		resolvers
	}
}