import { diffKeys } from "../src/valuestore/utils"

describe("ValueStore", () => {

    it('Changes to 0', () => {
        const keys = diffKeys({PMP101: {speed: '26.15', manual: true}}, {PMP101: {speed: '0.00', manual: false}})
        console.log(JSON.stringify({keys}))
    })  

    it('Changed values', () => {
        const keys = diffKeys({PMP101: {speed: 27}}, {PMP101: {speed: 0}});

        console.log(JSON.stringify({keys}));
    })

    it('Changed from real-world', () => {
        console.time('RealWorld')
        const keys = diffKeys({
            PMD801: {OperMode: 0, manual: null},
            PMD901: {OperMode: 0, manual: null},
            PMD1801: {OperMode: 0, manual: null},
            PMD1901: {OperMode: 0, manual: null},
            PMD1101: {OperMode: 0, manual: null},
            PMD1301: {OperMode: 0, manual: null},
            PMD1501: {OperMode: 0, manual: null},
            PMD8101: {OperMode: 0, manual: null},
            PMD8901: {OperMode: 0, manual: null},
            PMD9801: {OperMode: 0, manual: null},
        }, {
            PMD801: {OperMode: 0, manual: null},
            PMD901: {OperMode: 0, manual: null},
            PMD1801: {OperMode: 0, manual: null},
            PMD1901: {OperMode: 0, manual: null},
            PMD1101: {OperMode: 0, manual: null},
            PMD1301: {OperMode: 0, manual: null},
            PMD1501: {OperMode: 0, manual: null},
            PMD8101: {OperMode: 0, manual: null},
        })
        console.timeEnd('RealWorld')

        console.log(JSON.stringify(keys))
    })
})