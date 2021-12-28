import { config } from 'dotenv'
config()

import express from 'express';
import neo4j from "neo4j-driver"
import { Neo4jGraphQL } from "@neo4j/graphql"
import { graphqlHTTP } from "express-graphql"

import typeDefs from './schema'
import resolved from './resolvers';

(async () => {
	const driver = neo4j.driver(
		process.env.NEO4J_URI || "localhost",
		neo4j.auth.basic(process.env.NEO4J_USER || "neo4j", process.env.NEO4J_PASSWORD || "test")
	)

	const neoSchema : Neo4jGraphQL = new Neo4jGraphQL({ typeDefs, resolvers: {

	}, driver })

	const app = express()

	app.use("/graphql", graphqlHTTP({
		schema: neoSchema.schema,
		graphiql: true,
	}))

	app.listen('9010')

})()