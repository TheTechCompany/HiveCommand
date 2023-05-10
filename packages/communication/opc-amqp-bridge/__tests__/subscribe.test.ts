import { OPCUAServer } from 'node-opcua';
import {OPCMQTTClient} from '../src';
import { OPCServer } from '../test-helpers/server';

let server : OPCUAServer;

beforeAll(async () => {
   
    server = await OPCServer()

    // server.start()
});

afterAll(() => {
    server.shutdown()
})

describe('Subscriptions', () => {

    it('Can subscribe', async () => {

        await new Promise(async (resolve) => {

            const client = new OPCMQTTClient({
                opcuaServer: 'opc.tcp://localhost:4840',
                // subscriptionMap: [
                //     {
                //         path: '/Objects/1:PMP101/1:On',
                //         tag: "PMP101.On"
                //     }
                // ],
                subscriptionMap: [ 
                        {
                            path: '/Objects/1:PMP101/1:On',
                            tag: 'PMP101.On'
                        },
                        {
                            path: '/Objects/1:PMP101/1:Speed',
                            tag: 'PMP101.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP102.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP102.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP103.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP103.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP104.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP104.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP105.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP105.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP106.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP106.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP107.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP107.Speed'
                        },
                        {
                            path: '/Objects/1:PMP102/1:On',
                            tag: 'PMP108.On'
                        },
                        {
                            path: '/Objects/1:PMP102/1:Speed',
                            tag: 'PMP108.Speed'
                        }
                ],
                tags: [
                    {name: 'PMP101', type: 'Pump'}, 
                    {name: 'PMP102', type: 'Pump'},
                    {name: 'PMP103', type: 'Pump'},
                    {name: 'PMP104', type: 'Pump'},
                    {name: 'PMP105', type: 'Pump'},
                    {name: 'PMP106', type: 'Pump'},
                    {name: 'PMP107', type: 'Pump'},
                    {name: 'PMP108', type: 'Pump'},
                ],
                types: [{name: 'Pump', fields: [{name: 'On', type: "Boolean"}, {name: "Speed", type: "Number"}] }],
                deviceMap: [
                    {
                        path: 'PMP101.On',
                        tag: '/Objects/1:PMP101/1:On'
                    },
                    {
                        path: 'PMP101.Speed',
                        tag: '/Objects/1:PMP101/1:Speed'
                    },
                    {
                        path: 'PMP102.On',
                        tag: '/Objects/1:PMP101/1:On'
                    },
                    {
                        path: 'PMP102.Speed',
                        tag: '/Objects/1:PMP101/1:Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP103.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP103.Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP104.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP104.Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP105.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP105.Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP106.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP106.Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP107.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP107.Speed'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:On',
                        path: 'PMP108.On'
                    },
                    {
                        tag: '/Objects/1:PMP102/1:Speed',
                        path: 'PMP108.Speed'
                    }
                ]
            });


            await client.start();
            

            let counter = 0;

            client.on('data-changed', (e) => {

                if(Object.keys(e.value).indexOf('On') > -1) counter++;
                if(counter == 16){
                    // client.shutdown();
                    resolve(true);
                }
                

                // resolve(true)
            })
        })


    })
})