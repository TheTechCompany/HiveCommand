import { MQTTHub } from '../src';
import {MQTTClient} from '@hive-command/amqp-client';
import amqplib from 'amqplib';


// jest.mock('@hive-command/opcua-mqtt', () => {

//     return {
//         MQTTClient: jest.fn().mockImplementation(() => ({
//             connect: connectFn
//         }))
//     }
// });


describe('AMQP Hub - Connection', () => {
  it('Can connect', async () => {

    const res = await new Promise(async (resolve) => {

        jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {
            resolve(true);

            return {
                once: (key: 'string', fn: any) => {
        
                },
                createChannel: async () => {
                    return {
                        assertExchange: () => {
        
                        },
                        consume: () => {
        
                        }
                    }
                }
            }
        }) as any)
        
        const hub = new MQTTHub({
            user: '',
            pass: '',
            host: '',
            exchange: ''
        })

        await hub.setup()

        await hub.subscribe();

    })

    expect(res).toBe(true)


  });
  
  it('Can reconnect', async () => {

    let connectionCount = 0;
  
    const res = await new Promise(async (resolve) => {


        jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {

            console.log("ConnectionCount", connectionCount);
            
            connectionCount += 1;


            if(connectionCount >= 3){
                resolve(true);
            }else{
                throw new Error('12134');
            }



            return {
                once: (key: 'string', fn: any) => {

                },
                createChannel: async () => {
                    return {
                        assertQueue: () => {

                        },
                        assertExchange: () => {

                        },
                        consume: () => {

                        }
                    }
                }
            }
        }) as any)

        const hub = new MQTTHub({
            user: '',
            pass: '',
            host: '',
            exchange: ''
        })

        await hub.setup()

        await hub.subscribe();
    });

    expect(res).toBe(true);

  });
})