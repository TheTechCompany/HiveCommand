#!/usr/bin/env node
require('dotenv').config()

import { DiscoveryServer } from "./index";

(async () => {
	const server = new DiscoveryServer();

	await server.listen(8080);
})()
