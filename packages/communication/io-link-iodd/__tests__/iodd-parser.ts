'use strict';

import { readFileSync } from 'fs';
import { parseIODD, convertIODD } from '../src';
import { IODD, IODDFilter } from '../src/types';
import { createFilter, getBits } from '../src/utils';

let iodd: string;
let iodd_result: IODD;

beforeAll(async () => {
    iodd = readFileSync(__dirname + '/iodd-ldl100.xml', 'utf-8')
    const result = await parseIODD(iodd)
    iodd_result = await convertIODD(result)
})

describe('IODD Parser', () => {
    it('Retrieved fields', () => {
        let names : any[] = iodd_result.function.inputs.map((x) => {
            return x.struct.map((y) => y.name)
        })

        console.log(names)
        expect(names[0].indexOf('Temperature') > -1).toBe(true)
    })

    it('Filter IO-Link Raw Output', async () => {
       
        let filters : IODDFilter[] = iodd_result.function.inputs.map((x) => {
            return createFilter(x.struct.map((y) => ({name: y.name, ...y.bits})))
        })

        filters.forEach((filter) => {
           // let result = filter("00000200067CFE00") //pv8003 iodd.xml 0==
            let result = filter('00000000FC00000000BCFF00')
            console.log(result)

            expect(result.Temperature).toBe(188)
        })
    })

    it('IO-Link MDC', () => {
        let val = getBits('00000200067CFE00', 40, 8)

        let val2 = getBits('00000200067CFE00', 64-8, 8)
        console.log(val, val2)
    })
})