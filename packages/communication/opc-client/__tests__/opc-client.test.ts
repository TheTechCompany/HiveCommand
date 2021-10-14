'use strict';

import Client from '..';

const url = "opc.tcp://localhost:26543";

let client = new Client();


beforeAll(async () => {
    await client.connect(url)
})

afterAll(async () => {
    await client.disconnect()
})

describe('opc-client', () => {

    test('Object discovery', async () => {
        const devices = await client.browse('/Objects')
        const names = devices?.references?.map((x) => x.browseName.toString())
        expect(names).toEqual(["Server", "Aliases", "1:Devices"])
    })

    test('Device discovery', async () => {
        const devices = await client.browse('/Objects/1:Devices')
        const names = devices?.references?.map((x) => x.browseName.toString())
        expect(names).toEqual(["1:AV101"])
    })

    test('Device inspection', async () => {
        const device = await client.browse('/Objects/1:Devices/1:AV101')
        const names = device?.references?.map((x) => x.browseName.toString())

        expect(names).toEqual(["1:Temperature"])
    })

    test('Subscription', async () => {
        const subscription = await client.subscribe({path: '/Objects/1:Devices/1:AV101/1:Temperature'})
        if(subscription){
            console.log(subscription)
            const r = await new Promise(resolve => {
                subscription.on('changed', (val) => {
                    resolve(val.value.value)
                })
            })

            expect(r).toBeGreaterThan(0)
           
        }
    })
});
