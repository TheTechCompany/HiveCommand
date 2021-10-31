import OPCClient from '../src';
// import os from 'os';
import { DataType } from 'node-opcua-variant';
const client = new OPCClient(`opc.tcp://localhost:8440`);

(async () => {
    // console.log(client)
    // await client.connect(`opc.tcp://localhost:8440`)
    // const session = await client.getSession()
  
    // const discovered = await client.discover()
    // console.log(discovered)

    await client.connect("opc.tcp://localhost:8440")

    await client.setDetails(`/Objects/1:Controller/1:Machine/1:CommandPoint`, DataType.Double, 13.0)

    console.log("SET")

    // let path_id = await client.browse('/Objects/1:Devices')
    // console.log(path_id)
    // let result = await client.setDetails('/Objects/1:Devices/1:AV101/1:Inputs', 0.767)
    // console.log(path_id, result)
})()