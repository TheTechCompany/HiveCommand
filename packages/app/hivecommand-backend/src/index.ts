import { config } from 'dotenv'
config()

import { HiveGraph } from '@hexhive/graphql-server'

import amqp from 'amqplib'
import cors from 'cors';
import express from 'express';
import { connect_data } from '@hexhive/types';
import schema from './schema'

import { Pool, types } from 'pg';

import { PrismaClient } from "@hive-command/data";

types.setTypeParser(1114, (value) => {
	// console.log({value})
	return new Date(`${value}+0000`)
});

const prisma = new PrismaClient();

(async () => {

	await connect_data()

	const pool = new Pool({
		host: process.env.TIMESERIES_HOST || 'localhost',
		user: process.env.TIMESERIES_USER || 'postgres',
		password: process.env.TIMESERIES_PASSWORD || 'quest',
		port: 5432,
		keepAlive: true,
		// connectionTimeoutMillis: 60 * 1000,
		max: 10
	})

	pool.on('connect', () => {
		console.log("pool connect")
	})

	const mq = await amqp.connect(
		process.env.RABBIT_URL || 'amqp://localhost'
	)

	console.log("RabbitMQ")

	const mqChannel = await mq.createChannel()

	await mqChannel.assertQueue(`COMMAND:MODE`);
	await mqChannel.assertQueue(`COMMAND:STATE`);

	await mqChannel.assertQueue(`COMMAND:DEVICE:CONTROL`)
	await mqChannel.assertQueue(`COMMAND:DEVICE:MODE`);
	await mqChannel.assertQueue(`COMMAND:FLOW:PRIORITIZE`);


	const { typeDefs, resolvers } = schema(prisma, pool, mqChannel);

	console.log({typeDefs})
	console.log("Setting up graph")

	const graphServer = new HiveGraph({
		dev: false,
		rootServer: process.env.ROOT_SERVER || 'http://localhost:7000',
		schema: {
			typeDefs: typeDefs,
			resolvers: resolvers,
		}
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