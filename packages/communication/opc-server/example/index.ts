import { DataType, Variant } from 'node-opcua';
import OPCServer from '..'

const server = new OPCServer({
    productName: "Sudbuster",
    discoveryServer: 'opc.tcp://localhost:4840'
});

(async () => {
    
    await server.start()

    // await server.addDevice({name: 'AV101', type: 'valve'}, {state: {
    //     serial: {
    //         type: DataType.String,
    //         get: () => {
    //             return new Variant({dataType: DataType.String, value: "SERIALCODE"})
    //         }
    //     }
    // }})


    // let device = await server.addDevice({name: "AV101", type: 'valve'})
})()