import { config } from 'dotenv'
config()

import { HiveGraph } from '@hexhive/graphql-server'

import { MQTTClient } from '@hive-command/amqp-client'
import cors from 'cors';
import express from 'express';
import schema from './schema'

import { Pool, types } from 'pg';

import { cache, PrismaClient } from "@hive-command/data";
import { contextFactory } from './context';
import { redis } from './context/pubsub'

types.setTypeParser(1114, (value) => {
	return new Date(`${value}+0000`)
});

const prisma = new PrismaClient();

cache.connect_to(process.env.MONGO_URL || '');

(async () => {

	await redis.connect()

	const deviceMQ = new MQTTClient({
		host: process.env.DEVICE_MQ || '',
	})

	await deviceMQ.connect();

	// const deviceMQ = await amqp.connect(
	// 	process.env.DEVICE_MQ || ''
	// )

	console.log("RabbitMQ")

	const { typeDefs, resolvers } = schema(prisma, deviceMQ);

	console.log({typeDefs})


	const graphServer = new HiveGraph({
		dev: false,
		rootServer: process.env.ROOT_SERVER || 'http://localhost:7000',
		schema: {
			typeDefs: typeDefs,
			resolvers: resolvers,
		},
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