import { TestServer } from './server';
import Client from '..';
import sinon from 'sinon'

function flushPromises() {
    // Wait for promises running in the non-async timer callback to complete.
    // From https://stackoverflow.com/a/58716087/308237
    return new Promise(resolve => setImmediate(resolve));
  }

  
describe('Subscriptions', () => {

    // let clock: any;

    // beforeEach(() => {
    //     clock = sinon.useFakeTimers()
    // })

    // afterEach(() => {
    //     clock.restore();
    // })

    it('Subscription can have inactivity for 60 seconds - Sinon', async () => {
       


        const server = await TestServer(4446)
        let client = new Client();

        await client.connect(`opc.tcp://localhost:4446`)

        const sub = await client.subscribe({path: '/Objects/1:Permeate'});

        if(sub){


            const r = new Promise((resolve) => {
                sub.on('changed', (val: any) => {
                    console.log("VALUE", val.value.value)
                    if(val.value.value === 213){
                        resolve(true)
                    }
                })
            })

            await new Promise((resolve) => setTimeout(resolve, 100))
            
            let clock = sinon.useFakeTimers({now: Date.now(), shouldAdvanceTime: true, shouldClearNativeTimers: true, })


            // jest.useFakeTimers();

            // jest.advanceTimersByTime(10 * 1000)

            // // await clock.tickAsync(1000);
            //   // Fast-forward until all timers have been executed
            // // jest.runOnlyPendingTimers();
           
            let changeValue = new Promise((resolve) => setTimeout(() => {

                console.log("Change value");

                server.changeValue(213);

                resolve(true)

            }, 120*1000))


            // clock.tick(140 * 1000)

            // setInterval(() => , 100);

            clock.tick(121 * 1000);

            // await flushPromises();

            // jest.advanceTimersByTime(121 * 1000)


            // jest.runAllTimers();

            // jest.advanceTimersByTime(140 * 1000)
            
            // jest.useRealTimers()

            clock.restore();

            await changeValue

            await r;

            // try{
            //     await r;
            
            // }catch(e){
            //     console.error(e)
            // }

            // await flushPromises()

            // jest.useRealTimers()

            await client.disconnect();

            await server.stop();



            // clock.uninstall();

            expect(r).resolves.toBe(true)
        }
    })  
    

    it('Subscription can have inactivity for 60 seconds - Jest', async () => {
       


        const server = await TestServer(4445)
        let client = new Client();

        await client.connect(`opc.tcp://localhost:4445`)

        const sub = await client.subscribe({path: '/Objects/1:Permeate'});

        if(sub){

            // let clock = sinon.useFakeTimers({now: Date.now(), shouldAdvanceTime: true, shouldClearNativeTimers: true, })

            const r = new Promise((resolve) => {
                sub.on('changed', (val: any) => {
                    console.log("VALUE", val.value.value)
                    if(val.value.value === 213){
                        resolve(true)
                    }
                })
            })

            jest.useFakeTimers();

            // jest.advanceTimersByTime(10 * 1000)

            // // await clock.tickAsync(1000);
            //   // Fast-forward until all timers have been executed
            // // jest.runOnlyPendingTimers();
           
            let changeValue = new Promise((resolve) => setTimeout(() => {

                console.log("Change value");

                server.changeValue(213);

                resolve(true)

            }, 120*1000))


            // clock.tick(140 * 1000)

            // setInterval(() => , 100);

            // clock.tick(10 * 1000);

            // await flushPromises();

            jest.advanceTimersByTime(121 * 1000)


            // jest.runAllTimers();

            // jest.advanceTimersByTime(140 * 1000)
            
            jest.useRealTimers()


            await changeValue

            await r;

            // try{
            //     await r;
            
            // }catch(e){
            //     console.error(e)
            // }

            // await flushPromises()

            // clock.restore();
            // jest.useRealTimers()

            await client.disconnect();

            await server.stop();



            // clock.uninstall();

            expect(r).resolves.toBe(true)
        }
    })  
});