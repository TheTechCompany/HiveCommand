import amqplib from 'amqplib'
import { MQTTClient } from '../src';

describe('AMQP Publisher', () => {
    it('Retries sending when failed', async () => {
        let connectionCount = 0;


        const res = await new Promise(async (resolve) => {

            jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {

                return {
                    once: (key: string, fn: any) => {
                        //Second connection trigger an internal error
                 
                    },
                    createChannel: async () => {
                        return {
                            assertExchange: () => {

                            },
                            consume: () => {

                            },
                            publish: () => {
                                connectionCount++;
                                if(connectionCount < 3){
                                    throw new Error("Publish fail")
                                }
                            }
                        }
                    }
                }
            }) as any)

            const client = new MQTTClient({
                host: '',
                user: '',
                pass: '',
                exchange: ''
            });

            // jest.runAllTimers()

            await client.connect();

            await client.publish('test', "Boolean", 'test')

            resolve(true)
            // jest.spyOn()

        })
        

        expect(res).toBe(true)
    })

    // it('Queues up publish writes in a Write ahead log', async () => {
    //     let connectionCount = 0;


    //     const res = await new Promise(async (resolve) => {

    //         jest.spyOn(amqplib, 'connect').mockImplementation((async (url: string) => {

    //             return {
    //                 once: (key: string, fn: any) => {
    //                     //Second connection trigger an internal error
                 
    //                 },
    //                 createChannel: async () => {
    //                     return {
    //                         assertExchange: () => {

    //                         },
    //                         consume: () => {

    //                         },
    //                         publish: () => {
    //                             connectionCount ++;
    //                             if(connectionCount >= 1){
    //                                 resolve(true);
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }) as any)

    //         const client = new MQTTClient({
    //             host: '',
    //             user: '',
    //             pass: '',
    //             exchange: ''
    //         });

    //         // jest.runAllTimers()
    //         client.publish('test-2', "Boolean", 'test-1')

    //         await client.connect();

    //     })
        

    //     expect(res).toBe(true)
    // })
})