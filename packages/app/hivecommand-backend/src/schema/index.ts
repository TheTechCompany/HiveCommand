import { PrismaClient } from "@hive-command/data";
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

import devices from './devices';
import hmi from './hmi';
import program from './program';

import operations from './operations'
import { MQTTPublisher } from '@hive-command/amqp-client';
import { Pool } from 'pg';
import templates from "./program/templates";

export default (prisma: PrismaClient, deviceChannel?: MQTTPublisher) => {

	
	const { typeDefs: deviceTypeDefs, resolvers: deviceResolvers } = devices(prisma);
	const { typeDefs: programTypeDefs, resolvers: programResolvers } = program(prisma)
	const { typeDefs: hmiTypeDefs, resolvers: hmiResolvers } = hmi(prisma)

	const { typeDefs: templateTypeDefs, resolvers: templateResolvers } = templates(prisma);

	const { typeDefs: operationTypeDefs, resolvers: operationResolvers } = operations(prisma, deviceChannel)

	const resolvers = mergeResolvers([
		deviceResolvers,
		programResolvers,
		hmiResolvers,
		operationResolvers,
		templateResolvers
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
		templateTypeDefs,
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