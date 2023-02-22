import { readFileSync } from 'fs';
import log from 'loglevel';
import type { Arguments, CommandBuilder } from 'yargs';
import { MQTTClient } from '../';

const pkg = require('../../package.json')

type Options = {
	mqttHost?: string;
	mqttUser?: string;
	mqttPass?: string;
    mqttExchange?: string;

    opcuaServer?: string;

    deviceMap?: string;
    subscriptionMap?: string;
    tags?: string;
    types?: string;
};
  
  export const command: string = 'pilot';
  export const desc: string = 'Pilot this ship, with a trusted commander';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
        opcuaServer: {type: 'string', description: 'OPCUA server to connect to', default: 'opc.tcp://localhost:8440'},
		
        mqttHost: {type: 'string', description: 'MQTT server host', default: 'iot.hexhive.io'},
        mqttUser: {type: 'string', description: 'MQTT server user'},
        mqttPass: {type: 'string', description: 'MQTT server pass'},
        mqttExchange: {type: 'string', description: 'MQTT Exchange'},

        mapFile: {type: 'string', description: 'Map File unified'},

        deviceMap: {type: 'string', description: 'Device Map File'},
        subscriptionMap: {type: 'string', description: 'Device Map File'},

        tags: {type: 'string', description: 'Tags File'},
        types: {type: 'string', description: 'Types file'},

	  })

  export const handler =  (argv: Arguments<Options>) => {
	const {  
        tags,
        types,
        deviceMap,
        subscriptionMap,

        mqttHost, 
        mqttUser, 
        mqttPass, 
        mqttExchange,

        opcuaServer 
    } = argv;

	console.info(`Starting OPC-MQTT-Client v${pkg.version}`);
	

    let tagList = [];
    let typeList = [];
    let deviceList = [];
    let subscriptionList = [];

    if(tags){
        tagList = JSON.parse(readFileSync(tags, 'utf8') || '[]')
    }

    if(types){
        typeList = JSON.parse(readFileSync(types, 'utf8') || '[]')
    }

    if(deviceMap){
        deviceList = JSON.parse(readFileSync(deviceMap, 'utf8') || '[]')
    }

    if(subscriptionMap){
        subscriptionList =  JSON.parse(readFileSync(subscriptionMap, 'utf8') || '[]')
    }

	const hostCommander = new MQTTClient({
		iot: {
            host: mqttHost,
            user: mqttUser,
            pass: mqttPass,
            exchange: mqttExchange
        },
        opcuaServer,
        
        tags: tagList,
        types: typeList,
        deviceMap: deviceList,
        subscriptionMap: subscriptionList
	})

    hostCommander.start().then(() => {
        log.info('MQTT Client started')
    }).catch((err) => {
        log.error(err);
    })


  };