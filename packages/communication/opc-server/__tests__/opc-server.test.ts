'use strict';
import OPCServer from '../src';

const server = new OPCServer({productName: 'Sudbuster'});

beforeAll(async () => {
    await server.start()

    await server.addDevice({name: "BLO701", type: 'blower'})
})

afterAll(async () => {
    await server.stop();
})

describe('opc-server', () => {
    test('Add valve', async () => {
        let av101 = await server.addDevice({name: "AV101", type: 'valve'})
        expect(av101?.type).toBe('1:Valve')
    })

    test('Get devices', async () => {
        let av101 = await server.getDevice("AV101")
        let blower = await server.getDevice("BLO701")
        expect(blower?.type).toBe("1:Blower")
        expect(av101?.type).toBe('1:Valve')
    })

    test('Get Types', async () => {
        let types = await server.getDeviceTypes();

        let typeArray = Object.keys(types).map((key) => types[key].browseName.toString())
        expect(typeArray).toEqual([
            "1:Valve", 
            "1:Blower", 
            "1:Pump", 
            "1:FlowSensor", 
            "1:PressureSensor", 
            "1:LevelSensor", 
            "1:Conductivity"])
    })
});
