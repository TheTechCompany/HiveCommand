import Client from '..';
import { TestServer } from './server';
import FakeTimers from "@sinonjs/fake-timers";

jest.setTimeout(10 * 1000);

const url = "opc.tcp://localhost:4444";

let client = new Client();

let server: any;

beforeAll(async () => {
    server = await TestServer()

    // jest.useFakeTimers();

    await client.connect(url)
})

afterAll(async () => {
    await client.disconnect()
    // 
    // jest.useRealTimers();

    await server?.stop()
})

describe('opc-client', () => {

    test('Object discovery', async () => {
        const devices = await client.browse('/Objects')
        const names = devices?.map((x) => x.browseName.toString())
        expect(names).toEqual(["Server", "Aliases", "1:Permeate"])
    })

    // test('Device discovery', async () => {
    //     const devices = await client.browse('/Objects/1:Devices')
    //     const names = devices?.map((x) => x.browseName.toString())
    //     expect(names).toEqual(["1:AV101"])
    // })

    // test('Device inspection', async () => {
    //     const device = await client.browse('/Objects/1:Devices/1:AV101')
    //     const names = device?.map((x) => x.browseName.toString())

    //     expect(names).toEqual(["1:Temperature"])
    // })

    test('Subscription', async () => {
        const subscription = await client.subscribe({path: '/Objects/1:Permeate'})

        if(subscription){

            const r = new Promise(resolve => {
                subscription.on('changed', (val) => {
                    console.log(val.value.value);
                    resolve(val.value.value)
                })
            })


            await r

            expect(r).resolves.toBeGreaterThan(0)
           
        }
    })

    test('Subscription with lots of items', async () => {
        const subscription = await client.subscribe({path: '/Objects/1:Permeate'})

        if(subscription){

            const r = new Promise(resolve => {
                subscription.on('changed', (val) => {
                    console.log("Multiple", val.value.value);
                    // resolve(val.value.value)
                })
            })


            await r

            expect(r).resolves.toBeGreaterThan(0)
           
        }
    })


    it('Subscription to multiple handles them ASAP', () => {

    })
});
