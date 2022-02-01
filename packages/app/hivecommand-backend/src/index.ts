import { config } from 'dotenv'
config()

import { HiveGraph } from '@hexhive/graphql-server'

import amqp from 'amqplib'
import cors from 'cors';
import express from 'express';
import neo4j from "neo4j-driver"
import { Neo4jGraphQL } from "@neo4j/graphql"
import { graphqlHTTP } from "express-graphql"
import { connect_data } from '@hexhive/types';
import typeDefs from './schema'
import resolvers from './resolvers';
import { Pool } from 'pg';

(async () => {


	await connect_data()
	
	const driver = neo4j.driver(
		process.env.NEO4J_URI || "localhost",
		neo4j.auth.basic(process.env.NEO4J_USER || "neo4j", process.env.NEO4J_PASSWORD || "test")
	)

	const pool = new Pool({
		host: process.env.TIMESERIES_HOST || 'localhost',
		user: process.env.TIMESERIES_USER || 'postgres',
		password: process.env.TIMESERIES_PASSWORD || 'quest',
		port: 5432,
		connectionTimeoutMillis: 60 * 1000
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

	//TODO figure out the race condition to get the OGM with merged models from hive-graph

	const resolved = await resolvers(driver.session(), pool, mqChannel)

	// const neoSchema : Neo4jGraphQL = new Neo4jGraphQL({ typeDefs, resolvers: resolved, driver })

	const graphServer = new HiveGraph({
		dev: true,
		rootServer: process.env.ROOT_SERVER || 'http://localhost:7000',
		schema: {
			typeDefs: typeDefs,
			resolvers: resolved,
			driver
		}
	})

	await graphServer.init()

	const app = express()

	
	app.use(cors())

	app.use(graphServer.middleware)

	app.use((req, res) => {
		console.log((req as any).user, (req as any).jwt)
	})

	
	app.listen('9010')

})()