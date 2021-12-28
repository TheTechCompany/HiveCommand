import { Arguments, CommandBuilder, string } from 'yargs';
import crypto from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import jwt from 'jsonwebtoken'

type Options = {
	path: string;
};
  
  export const command: string = 'generate';
  export const desc: string = 'Generate keys';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
		path: {type: 'string', description: "Key store location", default: '/tmp/'}
	  })

  export const handler =  (argv: Arguments<Options>) => {
	const { path } = argv;

	if(!existsSync(path)){
		console.error("Specified key folder does not exist")
		return process.exit(1)
	}
	crypto.randomBytes(48, (err, buff) => {
		if(err) throw new Error(err.message)
		let token = jwt.sign({deviceId: buff.toString('base64')}, 'test')
		
		writeFileSync(path, token)
		process.exit(0)
	})

  };