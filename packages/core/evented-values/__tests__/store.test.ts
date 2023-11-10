import { EventedValueStore } from '../';

describe('Event Value Store', () => {
    
    it('First update of key results in keyChanged', async () => {
        const r = await new Promise((resolve) => {

            let valueStore = new EventedValueStore();

            valueStore.on('keysChanged', (values) => {
                if(values?.find((a) => a.key == 'key')?.value == false){
                    resolve(true)
                }
            })

            valueStore.updateValue('key', false);
        })

        expect(r).toBe(true);

    })
})