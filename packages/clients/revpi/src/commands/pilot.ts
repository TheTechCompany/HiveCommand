import { readFileSync } from 'fs';
import type { Arguments, CommandBuilder } from 'yargs';
import { CommandClient } from '../';
const pkg = require('../../package.json')

type Options = {
	storagePath: string | undefined;
	privateKey?: string;
	networkInterface: string | undefined;
	commandCenter: string | undefined
	healthCenter: string | undefined,
	discoveryServer?: string;
	ignorePlugins?: string;
	jesus: boolean | undefined;
  };
  
  export const command: string = 'pilot';
  export const desc: string = 'Pilot this ship, with a trusted commander';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
		privateKey: {type: 'string'},
		commander: { type: 'string' },
		storagePath: {type: 'string'},
		discoveryServer: {type: 'string'},
		commandCenter: {type: 'string'},
		healthCenter: {type: 'string'},
		ignorePlugins: {type: 'string'},
		networkInterface: {type: 'string', description: 'network interface to scan for IO-Link masters on', default: 'eth0'},
		jesus: {type: 'boolean', description: 'In case the code is un-tested run in Jesus mode so at any point Jesus can take the wheel'}
	  })

  export const handler =  (argv: Arguments<Options>) => {
	const { commander, ignorePlugins, discoveryServer, healthCenter, privateKey, commandCenter, storagePath, networkInterface } = argv;

	console.info(`Starting HiveCommand Pilot v${pkg.version}`);
	
	let key = undefined;
	if(privateKey){
		key = readFileSync(privateKey, 'utf8')
	}

	const hostCommander = new CommandClient({
		storagePath,
		commandCenter,
		healthCenter: healthCenter,
		privateKey: key,
		ignorePlugins: ignorePlugins ? ignorePlugins.split(',').map((x) => x.trim()) : [],
		networkInterface: networkInterface,
		discoveryServer
	})

	hostCommander.start().then(() => {
		// process.exit(0);
	}).catch((err) => {
		console.log(err)
	})

  };