import { config } from 'dotenv'
config()

import { HiveGraph } from '@hexhive/graphql-server'

import { MQTTPublisher } from '@hive-command/amqp-client'
import cors from 'cors';
import express from 'express';
import schema from './schema'

import { Pool, types } from 'pg';

import { PrismaClient } from "@hive-command/data";
import { contextFactory } from './context';
import { redis } from './context/pubsub'

types.setTypeParser(1114, (value) => {
	return new Date(`${value}+0000`)
});

const prisma = new PrismaClient();

(async () => {

	await redis.connect()

	let deviceMQ : MQTTPublisher | undefined;
	
	if(process.env.DEVICE_MQ_HOST){
		deviceMQ = new MQTTPublisher({
			host: process.env.DEVICE_MQ_HOST || '',
			user: process.env.DEVICE_MQ_USER,
			pass: process.env.DEVICE_MQ_PASS
		})
		await deviceMQ.connect();
	}


	const { typeDefs, resolvers } = schema(prisma, deviceMQ);

	const graphServer = new HiveGraph({
		dev: false,
		rootServer: process.env.ROOT_SERVER || 'http://localhost:7000',
		schema: {
			typeDefs: typeDefs,
			resolvers: resolvers,
		},
		resources: [
			{
				name: 'CommandDevice', 
				actions: ['create', 'read', 'update', 'manage', 'control', 'delete'], 
				fields: ['id', 'name', 'provisioned']
			}, {
				name: 'CommandProgram', 
				actions: ['create', 'read', 'update', 'delete'],
				fields: ['id', 'name']
			},
			{
				name: 'CommandSchematic',
				actions: ['create', 'read', 'update', 'delete']
			},
			{
				name: 'CommandFunction',
				actions: ['create', 'read', 'update', 'delete']
			}
		],
	
		contextFactory: contextFactory
	})

	console.log("Graph server setup")

	await graphServer.init()
	console.log("Graph server init")
	
	const app = express()
	
	app.use(cors())

	app.use(graphServer.middleware)

	app.listen('9010', () => {
		console.log("Listening on 9010")
	})

})().catch(async (err) => {
	console.error("error ", err)
}).finally(async () => {
	await prisma.$disconnect();
})