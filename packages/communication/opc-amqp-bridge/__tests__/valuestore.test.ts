import { diffKeys } from "../src/valuestore/utils"

describe("ValueStore", () => {
    it('Changed values', () => {
        const keys = diffKeys({PMP101: {speed: 27}}, {PMP101: {speed: 0}});

        console.log(JSON.stringify({keys}));
    })

    it('Changed from real-world', () => {
        const keys = diffKeys({
            PMD801: {OperMode: 0, manual: null}
        }, {
            PMD801: {OperMode: 1, manual: true}
        })

        console.log(JSON.stringify(keys))
    })
})