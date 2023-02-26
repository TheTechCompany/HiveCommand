import { MQTTPublisher } from "../src";
import amqplib from 'amqplib'


beforeAll(() => {
    // jest.useFakeTimers()
})

afterAll(() => {
    // jest.useRealTimers();
})

describe('AMQP Client', () => {
    it('Connects to server', async () => {

        let asserted = false;

        await new Promise(async (resolve) => {

            jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {
                return {
                    once: (key: 'string', fn: any) => {

                    },
                    createChannel: async () => {
                        return {
                            assertExchange: () => {
                                resolve(true)
                            },
                            consume: () => {

                            }
                        }
                    }
                }
            }) as any)

            const client = new MQTTPublisher({
                host: '',
                user: '',
                pass: '',
                exchange: ''
            });

            await client.connect();
            // expect(val).toBe(true);
        })


    });

    it('Reconnects when client drops', async () => {
        let connectionCount = 0;


        const res = await new Promise(async (resolve) => {

            jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {

                connectionCount++;

                //On third connection exit successfully
                if (connectionCount == 3) {
                    resolve(true)
                }

                //First connection throw a normal js error
                if (connectionCount == 1) {
                    throw new Error("Disconnect")
                }

                return {
                    once: (key: string, fn: any) => {
                        //Second connection trigger an internal error
                        if (connectionCount == 2) {
                            setTimeout(() => {
                                if (key === 'error') fn('Disconnect');
                            }, 100)
                        }
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

            const client = new MQTTPublisher({
                host: '',
                user: '',
                pass: '',
                exchange: ''
            });

            // jest.runAllTimers()

            await client.connect();

        })
        

        expect(res).toBe(true)

    })

  
})