import { TestServer } from './server';
import Client from '../src';
  
// describe('Subscription Queues', () => {

(async () => {
//     it('Subscription doesnt build big queue', async () => {

        const res = await new Promise(async (resolve) => {

        
            let client = new Client();

            await client.connect(`opc.tcp://localhost:4840`);

            const {monitors} = await client.subscribeMulti([
                {path: '/Objects/1:PMP101/1:Speed', tag: 'PMP101.On'},
                {path: '/Objects/1:PMP102/1:Speed', tag: 'PMP102.On'},
                {path: '/Objects/1:PMP103/1:Speed', tag: 'PMP103.On'},
                {path: '/Objects/1:PMP104/1:Speed', tag: 'PMP104.On'},
                {path: '/Objects/1:PMP105/1:Speed', tag: 'PMP105.On'}
            ], 1000)

            monitors?.on('changed', async (item, val) => {

                console.log({val: val.value.value})

            })

        })

        // expect(res).toBe(2);

    })()

//     });
    

//     // it('Subscription can have inactivity for 60 seconds - Jest', async () => {
       


//     //     const server = await TestServer(4445)
//     //     let client = new Client();

//     //     await client.connect(`opc.tcp://localhost:4445`)

//     //     const sub = await client.subscribe({path: '/Objects/1:Permeate'});

//     //     if(sub){

//     //         // let clock = sinon.useFakeTimers({now: Date.now(), shouldAdvanceTime: true, shouldClearNativeTimers: true, })

//     //         const r = new Promise((resolve) => {
//     //             sub.on('changed', (val: any) => {
//     //                 console.log("VALUE", val.value.value)
//     //                 if(val.value.value === 213){
//     //                     resolve(true)
//     //                 }
//     //             })
//     //         })

//     //         jest.useFakeTimers();

//     //         // jest.advanceTimersByTime(10 * 1000)

//     //         // // await clock.tickAsync(1000);
//     //         //   // Fast-forward until all timers have been executed
//     //         // // jest.runOnlyPendingTimers();
           
//     //         let changeValue = new Promise((resolve) => setTimeout(() => {

//     //             console.log("Change value");

//     //             server.changeValue(213);

//     //             resolve(true)

//     //         }, 120*1000))


//     //         // clock.tick(140 * 1000)

//     //         // setInterval(() => , 100);

//     //         // clock.tick(10 * 1000);

//     //         // await flushPromises();

//     //         jest.advanceTimersByTime(121 * 1000)


//     //         // jest.runAllTimers();

//     //         // jest.advanceTimersByTime(140 * 1000)
            
//     //         jest.useRealTimers()


//     //         await changeValue

//     //         await r;

//     //         // try{
//     //         //     await r;
            
//     //         // }catch(e){
//     //         //     console.error(e)
//     //         // }

//     //         // await flushPromises()

//     //         // clock.restore();
//     //         // jest.useRealTimers()

//     //         await client.disconnect();

//     //         await server.stop();



//     //         // clock.uninstall();

//     //         expect(r).resolves.toBe(true)
//     //     }
//     // })  
// });