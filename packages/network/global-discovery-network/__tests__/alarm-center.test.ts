import { AlarmCenter } from "../src/alarm-center"

describe('Alarm center', () => {
    it('Can load alarms without lagging too much', async () => {

        const alm = new AlarmCenter();

        const startTime = Date.now();

        await alm.hook(
            [{
                id: '1', 
                title: 'Alarm', 
                script: `export const handler = () => {
                    if(false){
                        raiseAlarm();
                    }
                }`
            },
            {
                id: '2', 
                title: 'Alarm', 
                script: `export const handler = () => {
                    if(false){
                        raiseAlarm();
                    }
                }`
            }], 
            [],
            {id: ''},
            {}, 
            {}
        )

        const endTime = Date.now();

        //Runtime latency
        expect(endTime - startTime).toBeLessThan(200)

    })

    it('Alarm triggers raiseAlarm', async () => {

        const res = await new Promise(async (resolve) => {
            let causeId, deviceId;

            const alm = new AlarmCenter({
                alarm: {
                    create: (data: any) => {
                        causeId = data?.data?.cause?.connect?.id;
                        deviceId = data?.data?.device?.connect?.id;

                        if(causeId == '1' && deviceId == '1234'){
                            resolve(true);
                        }
                    }
                }
            } as any);
    
    
            await alm.hook(
                [{
                    id: '1', 
                    title: 'Alarm', 
                    script: `export const handler = () => {
                        if(true){
                            raiseAlarm();
                        }
                    }`
                },
                {
                    id: '2', 
                    title: 'Alarm', 
                    script: `export const handler = () => {
                        if(false){
                            raiseAlarm();
                        }
                    }`
                }], 
                [],
                {id: '1234'},
                {}, 
                {}
            )
    
        })
        

        expect(res).toBe(true)
    })

    it('Alarm triggers sendNotification', async () => {

        const res = await new Promise(async (resolve) => {

            (fetch as any) = jest.fn(() => {
                resolve(true)
                return Promise.resolve({
                    json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
                })
            })
            // cojest.mock('sms');
            // , () => {
            //     return () => {
            //         resolve(true)
            //     }
            // })
            const alm = new AlarmCenter({
                device: {
                    findFirst: () => {
                        return {
                            activeProgram: {
                                alarmPathways: [{name: 'SMS', script: `
                                export const sendNotification = (message: string) => {
                                    fetch('')
                                }`}]
                            }
                        }
                    }
                },
                alarm: {
                    create: (data: any) => {
                        let causeId = data?.data?.cause?.connect?.id;
                        let deviceId = data?.data?.device?.connect?.id;
    
                        if(causeId == '1' && deviceId == '1234'){
                            // resolve(true);
                        }
                    }
                }
            } as any);
        
            await alm.hook(
                [{
                    id: '1', 
                    title: 'Alarm', 
                    script: `export const handler = () => {
                        if(true){
                            sendNotification("Test message", PATHWAYS.SMS);
                        }
                    }`
                }], 
                [{name: 'SMS'}],
                {id: ''},
                {}, 
                {}
            )
    
        })
       
        expect(res).toBe(true);
    })
})