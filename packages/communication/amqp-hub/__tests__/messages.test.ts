import amqplib, {ConsumeMessage} from 'amqplib';
import { MQTTHub } from '../src';

describe('AMQP Hub - Messages', () => {
    
    it('Can parse incoming message', async () => {

    const res = await new Promise(async (resolve) => {

        jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {

            // connectionCount++;


            // //On third connection exit successfully
            // if (connectionCount == 3) {
            //     resolve(true)
            // }

            // //First connection throw a normal js error
            // if (connectionCount == 1) {
            //     throw new Error("Disconnect")
            // }

            return {
                once: (key: string, fn: any) => {
                    //Second connection trigger an internal error
                    // if (connectionCount == 2) {
                    //     setTimeout(() => {
                    //         if (key === 'error') fn('Disconnect');
                    //     }, 100)
                    // }
                },
                createChannel: async () => {
                    return {
                        ack: () => {

                        },
                        bindQueue: () => {
                            
                        },
                        assertQueue: () => {
                            return {};
                        },
                        assertExchange: () => {

                        },
                        consume: (key: string, msg: (m: any | null) => void) => {
                            setTimeout(() => {
                                msg({
                                    fields: {
                                        routingKey: 'asdf',
                                    },
                                    properties: {
                                        userId: '1234',
                                    },
                                    content: '{}'
                                })
                            }, 500)
                        }
                    }
                }
            }
        }) as any)

        const hub = new MQTTHub({
            user: '',
            pass: '',
            host: '',
            exchange: '',
            onMessage: async () => {
                resolve(true);
            }
        })

        await hub.setup()

        await hub.subscribe();

    })

    expect(res).toBe(true);
    })
})