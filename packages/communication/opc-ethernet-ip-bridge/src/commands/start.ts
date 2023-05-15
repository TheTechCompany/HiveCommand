import { Arguments, CommandBuilder, string } from 'yargs';
import crypto from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { EthernetIPBridge, ListenTag } from '..';

type Options = {
	host: string;
    slot?: number;
	tags?: string;
	configure?: boolean
};
  
  export const command: string = 'start';
  export const desc: string = 'Start OPC-UA -> Ethernet/IP Bridge';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
        host: {type: 'string', description: 'Ethernet/IP Host', required: true},
        slot: {type: 'number', description: 'Slot number', default: 0},
		tags: {type: 'string', description: 'Tag whitelist json file'},
		configure: {type: 'boolean', description: 'Configure tag whitelist', default: false}
	  })

  export const handler =  (argv: Arguments<Options>) => {
	const { host, slot, tags, configure } = argv;

	
    const bridge = new EthernetIPBridge({host, slot, listenTags: tags, configure})

	bridge.start()

	// if(!existsSync(path)){
	// 	console.error("Specified key folder does not exist")
	// 	return process.exit(1)
	// }
	// crypto.randomBytes(48, (err, buff) => {
	// 	if(err) throw new Error(err.message)
	// 	let token = jwt.sign({deviceId: buff.toString('base64')}, 'test')
		
	// 	writeFileSync(path, token)
	// 	process.exit(0)
	// })

  };