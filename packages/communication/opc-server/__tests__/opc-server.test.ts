'use strict';
import OPCServer from '../src';
import OPCClient from '@hive-command/opcua-client'
const server = new OPCServer({productName: 'Sudbuster'});
const client = new OPCClient();

beforeAll(async () => {
    await server.start()

    await server.addDevice({name: "BLO701", type: 'blower'})

    // console.log(server.endpoint)
    // await client.connect(server.endpoint)
})

afterAll(async () => {
    await server.stop();
})

describe('opc-server', () => {
    test('Add valve', async () => {
        let av101 = await server.addDevice({name: "AV101", type: 'valve'})
        expect(av101?.type).toBe('1:valve')
    })

    test('Get devices', async () => {
        let av101 = await server.getDevice("AV101")
        let blower = await server.getDevice("BLO701")
        expect(blower?.type).toBe("1:blower")
        expect(av101?.type).toBe('1:valve')
    })

    test('Add variable', async () => {
        await server.addVariable('Test', 'String', () => "Test", () => {});

        // const results = await client.browse('/1:Objects')
        // console.log({results})
    })

    // test('Get Types', async () => {
    //     let types = await server.getDeviceTypes();

    //     let typeArray = Object.keys(types).map((key) => types[key].browseName.toString())
    //     expect(typeArray).toEqual([
    //         "1:blower", 
    //         "1:Pump", 
    //         "1:FlowSensor", 
    //         "1:PressureSensor", 
    //         "1:LevelSensor", 
    //         "1:Conductivity",
    //         "1:valve",
    //     ])
    // })
});
