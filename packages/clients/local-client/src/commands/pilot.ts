import { readFileSync } from 'fs';
import log from 'loglevel';
import type { Arguments, CommandBuilder } from 'yargs';
import { CommandClient } from '../';
const pkg = require('../../package.json')

type Options = {
	logLevel?: string;
	storagePath: string | undefined;
	privateKey?: string;
	hostname?: string;
	networkInterface: string | undefined;
	healthCenter: string | undefined,
	discoveryServer?: string;
	ignorePlugins?: string;
	pluginDir: string;
	purposeFile?: string;
  };
  
  export const command: string = 'pilot';
  export const desc: string = 'Pilot this ship, with a trusted commander';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
		  logLevel: {type: 'string', default: 'info'},
		privateKey: {type: 'string'},
		commander: { type: 'string' },
		storagePath: {type: 'string'},
		hostname: {type: 'string'},
		discoveryServer: {type: 'string', description: 'OPCUA Server to connect to', default: 'opc.tcp://discovery.hexhive.io:4840'},
		// commandCenter: {type: 'string', description: 'Websocket having endpoint for healthchecks and program info', default: 'http://discovery.hexhive.io:8080'},
		// healthCenter: {type: 'string', description: '', default: ''},
		purposeFile: {type: 'string', description: 'Purpose file'},
		ignorePlugins: {type: 'string'},
		pluginDir: {type: 'string', default: '/tmp/plugins'},
		networkInterface: {type: 'string', description: 'network interface to scan for IO-Link masters on', default: 'eth0'},
	  })

  export const handler =  (argv: Arguments<Options>) => {
	const { commander, hostname, pluginDir, purposeFile, logLevel, ignorePlugins, discoveryServer, healthCenter, privateKey, commandCenter, storagePath, networkInterface } = argv;

	// console.info(`Starting HiveCommand Pilot v${pkg.version}`);
	
	let key = undefined;
	if(privateKey){
		key = readFileSync(privateKey, 'utf8')
	}
 
	const hostCommander = new CommandClient({
		storagePath,
		hostname: hostname || '',
		logLevel: logLevel ? (log.levels as any)[logLevel.toUpperCase()] : log.levels.INFO,
		// commandCenter,
		// healthCenter: healthCenter,
		purposeFile,
		healthCheck: {
			number: process.env.HEALTH_CHECK_NUMBER || '',
			message: process.env.HEALTH_CHECK_MESSAGE || '',
			username: process.env.HEALTH_CHECK_USERNAME || '',
			password: process.env.HEALTH_CHECK_PASSWORD || ''
		},
		privateKey: key,
		ignorePlugins: ignorePlugins ? ignorePlugins.split(',').map((x) => x.trim()) : [],
		pluginDir: pluginDir,
		networkInterface: networkInterface,
		discoveryServer
	})

	hostCommander.setup().then(() => {
		log.info(`Pilot setup`)
		hostCommander.start().then(() => {
			log.info(`Pilot started`)
		});
	}).catch((err) => {
		log.error(err)
	})
	// hostCommander.start().then(() => {
	// 	// process.exit(0);
	// }).catch((err) => {
	// 	// console.log(err)
	// })

  };