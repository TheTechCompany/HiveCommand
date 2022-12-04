import OPCClient from '../src';
import os from 'os';
import { DataType } from 'node-opcua';

const client = new OPCClient();
//`opc.tcp://${os.hostname()}:4840`

(async () => {
    // await client.connect(`opc.tcp://localhost:8440`)
    // const session = await client.getSession()
  
    // const discovered = await client.discover()
    // console.log(discovered)

    await client.connect("opc.tcp://192.168.200.30:8440");
    console.log("Connected")
    // let path_id = await client.browse('/Objects')
    
    // console.log(path_id)

    const resp = await client.setDetails('/Objects/1:BTP_MAIN/1:OperOff', DataType.Boolean, true)
    console.log("Written...", resp?.value)
    // let result = await client.setDetails('/Objects/1:Devices/1:AV101/1:Inputs', 0.767)
    // console.log(path_id, result)
})()