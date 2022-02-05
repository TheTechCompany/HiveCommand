# `Command Discovery Server`

> The `Command Discovery Server` is a service that allows you to discover commands that are available on the network.

## Usage

```
import { DiscoveryServer } from "@hive-command/discovery-server";

(async () => {
	const server = new DiscoveryServer();

	await server.listen(8080);
})()

```
