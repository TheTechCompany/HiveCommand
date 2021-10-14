import OPCClient from '../src';
import os from 'os';
const client = new OPCClient(`opc.tcp://${os.hostname()}:4840`);

(async () => {
    console.log(client)
    // await client.connect(`opc.tcp://localhost:8440`)
    // const session = await client.getSession()
  
    // const discovered = await client.discover()
    // console.log(discovered)

    await client.connect("opc.tcp://localhost:4840")

    let path_id = await client.browse('/Objects/1:Devices')
    console.log(path_id)
    // let result = await client.setDetails('/Objects/1:Devices/1:AV101/1:Inputs', 0.767)
    // console.log(path_id, result)
})()