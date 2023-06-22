import { CIP } from '@hive-command/ethernet-ip'
import { ControllerMock } from './controller.mock';

// jest.setTimeout
describe("Tag Parser", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('Can parse raw scalars', async () => {

        const e = await new Promise((resolve) => {
            const EthernetIPDriver = require("../src").default

            jest.mock('@hive-command/ethernet-ip', () => {
                return ControllerMock([{ name: 'RAW_BOOL' }], true)
            })

            const driver = new EthernetIPDriver({});

            const sub = driver.subscribe([
                {
                    name: 'RAW_BOOL',
                    type: {

                    }
                }
            ])

            sub.subscribe((d: any) => {
                console.log(d)
                resolve(d.RAW_BOOL)
                // expect(d.RAW_BOOL).toBe(true);
            })
        });
        expect(e).toBe(true);
    })

    it('Can parse root types', async () => {
        const e = await new Promise((resolve) => {

            const EthernetIPDriver = require("../src").default

            jest.mock('@hive-command/ethernet-ip', () => {
                return ControllerMock([{
                    name: 'RAW_TYPE',
                    type: {
                        structureObj: {
                            key: "STRING",
                            bool: "BOOL"
                        }
                    }
                }], { key: "asdaf", bool: true })
            })

            const driver = new EthernetIPDriver({});

            const sub = driver.subscribe([
                {
                    name: 'RAW_TYPE'
                }
            ])

            sub.subscribe((d: any) => {
                console.log(d)
                resolve(d.RAW_TYPE)
            })
        })

        expect(e).toBe({ key: 'asdaf', bool: true })
    })

    it('Can parse raw arrays', async () => {
        const e = await new Promise((resolve) => {

            const EthernetIPDriver = require("../src").default


            jest.mock('@hive-command/ethernet-ip', () => {
                return ControllerMock([{
                    name: 'RAW_ARR',
                    type: {
                        arrayDims: 1,
                    }
                }], ['Stuff'])
            })

            const driver = new EthernetIPDriver({});

            const sub = driver.subscribe([
                {
                    name: 'RAW_ARR'
                }
            ])
            sub.subscribe((d: any) => {
                console.log(d.RAW_ARR)
                resolve(d.RAW_ARR)
            })
        })

        expect(e).toBe(['Stuff'])
    })

    it('Can parse type arrays', async () => {
        const e = await new Promise((resolve) => {

            const EthernetIPDriver = require("../src").default
            jest.mock('@hive-command/ethernet-ip', () => {
                return ControllerMock([{
                    name: 'RAW_TYPE_ARR',
                    type: {
                        structureObj: {
                            arr: "DINT[]"
                        }
                    }
                }], { arr: [0, 1, 2] })
            })

            const driver = new EthernetIPDriver({});

            const sub = driver.subscribe([
                {
                    name: 'RAW_TYPE_ARR'
                }
            ])
            sub.subscribe((d: any) => {
                console.log(d)
                resolve(d.RAW_TYPE_ARR)
            })
        })
        expect(e).toBe({ arr: [0, 1, 2] })
    })

    it('Can parse nested types', async () => {
        const e = await new Promise((resolve) => {

            const EthernetIPDriver = require("../src").default

            jest.mock('@hive-command/ethernet-ip', () => {
                return ControllerMock([{
                    name: 'RAW_TYPE_TYPE',
                    type: {
                        structureObj: {
                            type: "TYPE"
                        }
                    }
                }], { type: { asdf: 1234 } })
            })


            const driver = new EthernetIPDriver({});

            const sub = driver.subscribe([
                {
                    name: 'RAW_TYPE_TYPE'
                }
            ])
            sub.subscribe((d: any) => {
                console.log(d)
                resolve(d.RAW_TYPE_TYPE)
            })
        })

        expect(e).toBe({ type: { asdf: 1234 } })
    })
})