import { readFileSync } from 'fs';
import log from 'loglevel';
import type { Arguments, CommandBuilder } from 'yargs';
import { IOTCLI } from '../';

const pkg = require('../../package.json')

type Options = {
    discoveryServer: string;

    deviceMap?: string;
    subscriptionMap?: string;

    provisionCode: string;
    
};
  
  export const command: string = 'start';
  export const desc: string = 'Start this ship';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
		
        discoveryServer: {type: 'string', required: true, description: 'Discovery server host', default: 'http://discovery.hexhive.io'},
       
        provisionCode: {type: 'string', required: true, description: 'Provision Code'}

	  })

  export const handler =  (argv: Arguments<Options>) => {
	const {  

        discoveryServer, 
        provisionCode
    } = argv;

	console.info(`Starting IOT-Cli v${pkg.version}`);
	

	const iotCli = new IOTCLI({
        discoveryServer,
        provisionCode
	})

    iotCli.start().then(() => {
        log.info('IOT Client started')
    }).catch((err) => {
        log.error(err);
    })


  };