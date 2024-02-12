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
            {id: ''},
            {}, 
            {}
        )

        const endTime = Date.now();

        //Runtime latency
        expect(endTime - startTime).toBeLessThan(200)

    })
})