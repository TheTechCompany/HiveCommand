import os from "os";
import path from "path";
import fs from "fs";

import { assert, OPCUACertificateManager, OPCUADiscoveryServer, extractFullyQualifiedDomainName, makeApplicationUrn, ServerSecureChannelLayer } from "node-opcua";

// Create a new instance of vantage.

import envPaths from "env-paths";


const paths = envPaths("node-opcua-local-discovery-server");
const configFolder = paths.config;
const pkiFolder = path.join(configFolder, "PKI");

const serverCertificateManager = new OPCUACertificateManager({
    automaticallyAcceptUnknownCertificate: true,
    rootFolder: pkiFolder,
    name: "PKI"
});

async function getIpAddresses() {

    const ipAddresses  : string[] = [];
    const interfaces = os.networkInterfaces();
    Object.keys(interfaces).forEach(function(interfaceName) {
        let alias = 0;

        interfaces[interfaceName]?.forEach((iFace) => {
            if ('IPv4' !== iFace.family || iFace.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(interfaceName + ':' + alias, iFace.address);
                ipAddresses.push(iFace.address);
            } else {
                // this interface has only one ipv4 address
                console.log(interfaceName, iFace.address);
                ipAddresses.push(iFace.address);
            }
            ++alias;
        });
    });
    return ipAddresses;
}

const applicationUri = "";




export interface DiscoveryServerOpts {
	applicationName?: string;
	automaticallyAcceptUnknownCertificate?: boolean;
	port?: number;
	tolerant?: boolean;
	force?: boolean;
    fqdn?: string;
}

export class DiscoveryService {

	private opts: DiscoveryServerOpts;

	private discoveryServer?: OPCUADiscoveryServer;

	private fqdn?: string;
	private applicationUri?: string;
	private applicationName?: string;

	constructor(opts: DiscoveryServerOpts){
		
		this.opts = opts;
		this.applicationName = this.opts.applicationName
  
        console.log("New Discovery Service ", this.applicationName)
	}

	get registeredServers(){
		return this.discoveryServer?.getServers(new ServerSecureChannelLayer({} as any))
	}

	get serverInfo (){
		return this.discoveryServer?.serverInfo
	}

	async init(){
		if(!this.applicationName) return;
		this.fqdn = this.opts.fqdn || process.env.HOSTNAME || await extractFullyQualifiedDomainName();
		
		this.applicationUri = makeApplicationUrn(this.fqdn, this.applicationName)
        await serverCertificateManager.initialize();

		const certificateFile = path.join(pkiFolder, "local_discovery_server_certificate.pem");
        const privateKeyFile = serverCertificateManager.privateKey;
        assert(fs.existsSync(privateKeyFile), "expecting private key");

		this.discoveryServer = new OPCUADiscoveryServer({
            // register
            port: this.opts.port,
            certificateFile,
            privateKeyFile,
            serverCertificateManager,
            serverInfo: {
                discoveryUrls: ['opc.tcp://192.168.200.6:4840'],
                applicationUri: this.applicationUri
            }
        });

        // this.discoveryServer.on('')

	}

	async start(){
		try {
            await this.discoveryServer?.start();
        } catch (err) {
            console.log("Error , cannot start LDS ", err);
            console.log("Make sure that a LocalDiscoveryServer is not already running on port 4840");
            return;
        }
        console.log(this.discoveryServer?.serverInfo.toString());
        console.log("discovery server started on port ", this.discoveryServer?.endpoints[0].port);
        console.log("CTRL+C to stop");
        console.log("rejected Folder ", this.discoveryServer?.serverCertificateManager.rejectedFolder);
        console.log("trusted  Folder ", this.discoveryServer?.serverCertificateManager.trustedFolder);

	}
}
// (async () => {
//     try {

//         const fqdn = process.env.HOSTNAME || await extractFullyQualifiedDomainName();

//         console.log("fqdn                                ", fqdn);
//         const applicationUri = makeApplicationUrn(fqdn, argv.applicationName);

//         await serverCertificateManager.initialize();

//         const certificateFile = path.join(pkiFolder, "local_discovery_server_certificate.pem");
//         const privateKeyFile = serverCertificateManager.privateKey;
//         assert(fs.existsSync(privateKeyFile), "expecting private key");

//         if (!fs.existsSync(certificateFile) || force) {

//             console.log("Creating self-signed certificate", certificateFile);

//             await serverCertificateManager.createSelfSignedCertificate({
//                 applicationUri,
//                 dns: argv.alternateHostname ? [argv.alternateHostname, fqdn] : [fqdn],
//                 ip: await getIpAddresses(),
//                 outputFile: certificateFile,
//                 subject: "/CN=Sterfive/DC=NodeOPCUA-LocalDiscoveryServer",
//                 startDate: new Date(),
//                 validity: 365 * 10,
//             })
//         }
//         assert(fs.existsSync(certificateFile));


//         const discoveryServer = new OPCUADiscoveryServer({
//             // register
//             port,
//             certificateFile,
//             privateKeyFile,
//             serverCertificateManager,
//             automaticallyAcceptUnknownCertificate,
//             serverInfo: {
//                 applicationUri
//             }
//         });

//         try {
//             await discoveryServer.start();
//         } catch (err) {
//             console.log("Error , cannot start LDS ", err.message);
//             console.log("Make sure that a LocalDiscoveryServer is not already running on port 4840");
//             return;
//         }
//         console.log(discoveryServer.serverInfo.toString());
//         console.log("discovery server started on port ", discoveryServer.endpoints[0].port);
//         console.log("CTRL+C to stop");
//         console.log("rejected Folder ", discoveryServer.serverCertificateManager.rejectedFolder);
//         console.log("trusted  Folder ", discoveryServer.serverCertificateManager.trustedFolder);


//         const vorpal = new Vorpal();
//         vorpal
//             .command("info")
//             .description("display list of registered servers.")
//             .action(function(args, callback) {

//                 this.log(discoveryServer.serverInfo.toString());
//                 // xx this.log(discoveryServer.endpoints[0]);

//                 {
//                     const servers = Object.keys(discoveryServer.registeredServers);
//                     this.log("number of registered servers : ", servers.length);

//                     for (const serverKey of servers) {
//                         const server = discoveryServer.registeredServers[serverKey];
//                         this.log("key =", serverKey);
//                         this.log(server.toString());
//                     }
//                 }
//                 {
//                     const server2 = Object.keys(discoveryServer.mDnsResponder.registeredServers);
//                     this.log("number of mNDS registered servers : ", server2.length);
//                     for (const serverKey of server2) {
//                         const server = discoveryServer.mDnsResponder.registeredServers[serverKey];
//                         this.log("key =", serverKey);
//                         this.log(server.toString());
//                     }
//                 }

//                 callback();
//             });
//         vorpal.delimiter("local-discovery-server$").use(vorpal_repl).show();

//     }
//     catch (err) {
//         console.log(err.message);
//         console.log(err);
//     }
// })();
