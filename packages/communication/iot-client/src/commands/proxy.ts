import { Arguments, CommandBuilder, string } from 'yargs';
import { IOTClient } from '..';
// import { existsSync, writeFileSync } from 'fs';
// import jwt from 'jsonwebtoken'

type Options = {
	keyphrase?: string;
	iotServer?: string;
	opcServer?: string;
};
  
  export const command: string = 'proxy';
  export const desc: string = 'Proxy local OPC-Server';
  
  export const builder: CommandBuilder<Options, Options> = (yargs) =>
	yargs
	  .options({
        iotServer: { type: 'string', description: 'IOT Server', default: 'iot.hexhive.io'},
        opcServer: { type: 'string', description: 'Local OPC Server'},
        keyphrase: {type: 'string', description: "Provision keyphrase"},
	  })

  export const handler =  async (argv: Arguments<Options>) => {
	const { keyphrase, iotServer, opcServer } = argv;

    if(!iotServer) throw new Error("No IOT Server specified");
    if(!opcServer) throw new Error("No OPC Server specified");
    if(!keyphrase) throw new Error("No keyphrase specified");

    const client = new IOTClient({
        iotServer: iotServer,
        opcServer: opcServer,
        keyphrase
    })

    await client.connect()

    console.log("Client connected...");
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