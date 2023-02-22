import { readFileSync } from 'fs';
import log from 'loglevel';
import type { Arguments, CommandBuilder } from 'yargs';
import { IOTCLI } from '../';

const pkg = require('../../package.json')

type Options = {
    discoveryServer: string;
    opcuaServer: string;

    deviceMap?: string;
    subscriptionMap?: string;

    provisionCode: string;
    
};
  
  export const command: string = 'pilot';
  export const desc: string = 'Pilot this ship, with a trusted commander';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
        opcuaServer: {type: 'string', required: true, description: 'OPCUA server to connect to', default: 'opc.tcp://localhost:8440'},
		
        discoveryServer: {type: 'string', required: true, description: 'Discovery server host', default: 'iot.hexhive.io'},
       
        mapFile: {type: 'string', description: 'Map File unified'},

        deviceMap: {type: 'string', description: 'Device Map File'},
        subscriptionMap: {type: 'string', description: 'Device Map File'},

        provisionCode: {type: 'string', required: true, description: 'Provision Code'}

	  })

  export const handler =  (argv: Arguments<Options>) => {
	const {  

        deviceMap,
        subscriptionMap,

        discoveryServer, 
        opcuaServer,
        provisionCode
    } = argv;

	console.info(`Starting IOT-Cli v${pkg.version}`);
	
    let deviceList = [];
    let subscriptionList = [];


    if(deviceMap){
        deviceList = JSON.parse(readFileSync(deviceMap, 'utf8') || '[]')
    }

    if(subscriptionMap){
        subscriptionList =  JSON.parse(readFileSync(subscriptionMap, 'utf8') || '[]')
    }

	const iotCli = new IOTCLI({
        opcuaServer,
        discoveryServer,
    
        deviceMap: deviceList,
        
        subscriptionMap: subscriptionList,
        provisionCode
	})

    iotCli.start().then(() => {
        log.info('IOT Client started')
    }).catch((err) => {
        log.error(err);
    })


  };