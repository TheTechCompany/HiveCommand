import { Arguments, CommandBuilder, string } from 'yargs';
import crypto from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import { EthernetIPBridge } from '..';

type Options = {
	host: string;
    slot?: number;
};
  
  export const command: string = 'start';
  export const desc: string = 'Start OPC-UA -> Ethernet/IP Bridge';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
        host: {type: 'string', description: 'Ethernet/IP Host', required: true},
        slot: {type: 'number', description: 'Slot number', default: 0}
	  })

  export const handler =  (argv: Arguments<Options>) => {
	const { host, slot } = argv;

    const bridge = EthernetIPBridge(host, slot)

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