import { DataType, OPCUAClient } from 'node-opcua';
import { Sidecar } from '.';
import { EventEmitter } from 'events';

describe('Native Sidecar', () => {
    it('Load sidecar options from json', async () => {

        const result = await new Promise((resolve) => {

            const sidecar = new Sidecar({
                deviceMap: [
                    { path: 'AV101.open', tag: '/Objects/1:AV101/1:Open' },
                    { path: 'AV101.opening', tag: 'script://export const setter = (value, values, setValues) => { setValues({ AV101:  {Opening: true} }) }' }
                ],
                subscriptionMap: [
                    { tag: 'AV101.Open', path: '/Objects/1:AV101/1:Open' },
                    { path: '/Objects/1:AV101/1:Opening', tag: 'AV101.Opening' }
                ]
            });

            (sidecar as any).client = { getType: (path: string) => DataType.Boolean };

            (sidecar as any).setData = (client: OPCUAClient, path: string, dataType: DataType, value: any) => {
                console.log({ path, value })
                if (path === '/Objects/1:AV101/1:Opening') {
                    resolve(true)
                }
            }

            sidecar.setTag('AV101.opening', true)
        })

        expect(result).toBe(true);

    })

    it('Subscription is mapped to real value', async () => {

        const result = await new Promise(async (resolve) => {

            const sidecar = new Sidecar({
                tags: [{ name: 'AV101', type: 'Valve' }],
                types: [{ name: 'Valve', fields: [{ name: 'open', type: 'Boolean' }] }],
                deviceMap: [
                    { path: 'AV101.open', tag: '/Objects/1:AV101/1:Open' },
                    { path: 'AV101.opening', tag: 'script://export const setter = (value, values, setValues) => { setValues({ AV101:  {Opening: true} }) }' }
                ],
                subscriptionMap: [
                    { tag: 'AV101.Open', path: '/Objects/1:AV101/1:Open' },
                    { path: '/Objects/1:AV101/1:Opening', tag: 'AV101.Opening' }
                ]
            });

            (sidecar as any).client = {
                getType: (path: string) => DataType.Boolean, subscribeMulti: () => {

                    const eventEmitter = {
                        on: (key: string, handler: any) => {
                            setTimeout(() => {
                                handler(null, { value: true }, 0)
                            }, 100)
                        }
                    }

                    return {
                        unwrap: () => 'AV101.Open',
                        monitors: eventEmitter
                    }
                }
            };

            const { emitter } = await sidecar.subscribe([{ tag: 'AV101.Open', path: '/1:AV101/1:Open' }])

            emitter.on('data-changed', (data) => {
                resolve(data.key === 'AV101.open' && data.value == true)
            })
        })

        expect(result).toBe(true);

    })
})