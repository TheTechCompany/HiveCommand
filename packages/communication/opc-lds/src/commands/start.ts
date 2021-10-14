import { readFileSync } from 'fs';
import Vorpal from 'vorpal';
import type { Arguments, CommandBuilder } from 'yargs';
import { DiscoveryService as DiscoveryServer } from '..';
const vorpal_repl = require("vorpal-repl");

type Options = {
	port?: number;
	tolerant?: boolean;
	force?: boolean;
	alternateHostname?: string;
	fqdn?: string;
	applicationName?: string;
  };
  
  export const command: string = 'start';
  export const desc: string = 'Start discovery server';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	.options({
		fqdn: {type: "string"},
		port: {type: "number", description: "port to listen to (default: 4840)", default: 4840},
		tolerant: {type: "boolean", description: "automatically accept unknown registering server certificate", default: true},
		force: { type: "boolean", description: "force recreation of LDS self-signed certification (taking into account alternateHostname) ", default: false},
		alternateHostname: {type: 'string', description: "alternateHostname"},
		applicationName: {type: 'string', description: "the application name", default: "NodeOPCUA-DiscoveryServer"}
	})
	.alias("a", "alternateHostname")
    .alias("n", "applicationName")
    .alias("p", "port")
    .alias("f", "force")
    .alias("t", "tolerant")


  export const handler =  (argv: Arguments<Options>) => {
	const { port, tolerant, force, applicationName } = argv;

	console.log("port                                    ", port);
	console.log("automatically accept unknown certificate", tolerant);
	console.log("applicationName                         ", applicationName);


	const discoveryServer = new DiscoveryServer({
		port,
		automaticallyAcceptUnknownCertificate: tolerant,
		force,
		applicationName
	})

	discoveryServer.init().then(() => {
		discoveryServer.start().then(() => {



const vorpal = new Vorpal();
vorpal
	.command("info")
	.action(async (args) => {
		console.log(discoveryServer.serverInfo?.toString())
		console.log(discoveryServer.registeredServers)
		// this.log(discoveryServer.serverInfo.toString());
		// xx this.log(discoveryServer.endpoints[0]);

		// {
		// 	const servers = Object.keys(discoveryServer.registeredServers);
		// 	this.log("number of registered servers : ", servers.length);

		// 	for (const serverKey of servers) {
		// 		const server = discoveryServer.registeredServers[serverKey];
		// 		this.log("key =", serverKey);
		// 		this.log(server.toString());
		// 	}
		// }
		// {
		// 	const server2 = Object.keys(discoveryServer.mDnsResponder.registeredServers);
		// 	this.log("number of mNDS registered servers : ", server2.length);
		// 	for (const serverKey of server2) {
		// 		const server = discoveryServer.mDnsResponder.registeredServers[serverKey];
		// 		this.log("key =", serverKey);
		// 		this.log(server.toString());
		// 	}
		// }

		// callback();
	});

vorpal.delimiter("local-discovery-server$").use(vorpal_repl).show();
})
})

  };