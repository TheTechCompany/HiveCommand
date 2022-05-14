#!/usr/bin/env node
require('dotenv').config()

import { DiscoveryServer } from "./index";

(async () => {
	const server = new DiscoveryServer({
		apiKey: process.env.HEXHIVE_API_KEY,
		gatewayURL: process.env.HEXHIVE_API_URL
	});

	await server.listen(8080);
})()
