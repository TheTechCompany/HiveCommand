#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { HiveRemoteClient } from ".";

const argv = yargs(process.argv.slice(2)).options({
  endpoint: { type: 'string', default: "hahei-flow.hexhive.io" },
  deviceId: { type: 'string', required: true, description: 'CommandDevice ID' }
}).argv;

(async () => {
	const { endpoint, deviceId } = await argv;

	const client = new HiveRemoteClient({
		endpoint: endpoint,
		deviceId
	})

	await client.start()
})()

