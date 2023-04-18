import { diffKeys } from "../src/valuestore/utils"

describe("ValueStore", () => {
    it('Changed values', () => {
        const keys = diffKeys({PMP101: {speed: 27}}, {PMP101: {speed: 0}});

        console.log(JSON.stringify({keys}));
    })
})