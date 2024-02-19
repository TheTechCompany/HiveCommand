import { HMITag, HMIType } from '@hive-command/interface-types';
import { formatSnapshot, invertSnapshot } from '../src/utils/format'

const tags : HMITag[] = [{id: '101', name: 'PMP101', type: 'Pump'}];
const types : HMIType[] = [{id: '1', name: 'Pump', fields: [{id: '2', name: 'On', type: 'Boolean'}]}];

const values = [{deviceId: '1234', placeholder: 'PMP101', key: 'On', value: false}];

describe('Format utils', () => {
    it('Format snapshot produces clean output', () => {

        const sn = formatSnapshot(tags, types, values)
        expect(JSON.stringify(sn)).toBe(JSON.stringify({PMP101: {On: false}}))
    })

    it('Inverse snapshot creates typed object', () => {
        const sn = formatSnapshot(tags, types, values);
        const inv = invertSnapshot(sn, tags);

        expect(JSON.stringify(inv)).toBe(JSON.stringify({Pump: {PMP101: {On: false}} }));
    })
})