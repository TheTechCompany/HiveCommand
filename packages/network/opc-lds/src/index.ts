import os from "os";
import path from "path";
import fs from "fs";

import { OPCUADiscoveryServer } from './discovery-server'

import { assert, OPCUACertificateManager, extractFullyQualifiedDomainName, makeApplicationUrn, ServerSecureChannelLayer } from "node-opcua";

// Create a new instance of vantage.

import envPaths from "env-paths";
import { makeSubject } from "node-opcua";


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
		
        console.log({fqdn: this.fqdn});

		this.applicationUri = makeApplicationUrn(this.fqdn, this.applicationName)

        console.log({applicationUri: this.applicationUri});

        await serverCertificateManager.initialize();

		const certificateFile = path.join(pkiFolder, "local_discovery_server_certificate.pem");
        const privateKeyFile = serverCertificateManager.privateKey;

        assert(fs.existsSync(privateKeyFile), "expecting private key");

        if(!fs.existsSync(certificateFile) || this.opts.force){
            console.log({opts: this.opts})
            console.log("Creating self-signed certificate", certificateFile);

            console.log({applicationName: this.applicationName})
            const subject = makeSubject(this.applicationName, this.fqdn);

            console.log({subject});
            
            await serverCertificateManager.createSelfSignedCertificate({
                applicationUri: this.applicationUri,
                dns: [this.fqdn],
                // ip: await getIpAddresses(),
                outputFile: certificateFile,
                subject: subject, //"/CN=HiveCommand/DC=Discovery-Server",
                startDate: new Date(),
                validity: 365 * 10
            })
        }

        // assert(fs.existsSync(certificateFile));

		this.discoveryServer = new OPCUADiscoveryServer({
            // register
            hostname: this.fqdn,
            port: this.opts.port,
            certificateFile,
            privateKeyFile,
            serverCertificateManager,
            serverInfo: {
                discoveryUrls: [`opc.tcp://${this.opts.fqdn}:${this.opts.port}`],
                productUri: this.applicationName,
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
