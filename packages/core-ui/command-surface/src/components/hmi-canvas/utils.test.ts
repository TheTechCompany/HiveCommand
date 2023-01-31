import { getNodeValues } from "./utils"

describe('Command Surface - Utils', () => {
    it('Can handle template overrides', () => {
        const nodeValues = getNodeValues({
            id: '101',
            options: {
                on: ''
            },
            dataTransformer: {
                template: {
                    id: '102',
                    inputs: [{id: '103', key: 'device'}],
                    outputs: [{id: '104', key: 'on'}],
                    configuration: [{
                        id: '105',
                        from: {id: '103'},
                        to: {id: '104'},
                        script: `
                            export const getter = (inputs: any) => inputs.device.on;
                            export const setter = (setInputs: any) => setInputs({ device: {on: false} });
                        `
                    }]
                },
                configuration: [{id: '1', field: {id: '103'}, value: {on: '1234'}}]
            }
        });

        console.log(nodeValues)

        expect(nodeValues.on).toBe(true)
    })

    it('can parse function values', () => {
        const nodeValues = getNodeValues({
            id: '101',
            options: {
                on: {
                    fn: 'export const handler = () => false;'
                }
            }
        });

        expect(nodeValues.on).toBe(false);
    })

    it('can parse templated string', () => {
        const nodeValues = getNodeValues({
            id: '101',
            options: {
                on: '{{=it.valve.on}}'
            }
        });

        expect(nodeValues.on).toBe("false")
    })

    it('can parse literal string', () => {
        const nodeValues = getNodeValues({
            id: '101',
            options: {
                on: 'Valve'
            }
        });

        expect(nodeValues.on).toBe('Valve')
    })

    // it('can parse map', () => {
    //     const nodeValues = getNodeValues({
    //         id: '101',
    //         options: {
    //             // on: {connect: '102'}
                
    //         }
    //     });
    // })
})