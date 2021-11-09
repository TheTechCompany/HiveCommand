import { readFileSync } from 'fs';
import { IODD } from '../src/types';
import {parseIODD, convertIODD, createFilter} from '../src/utils/iodd'

let iodd;
let iodd_result : IODD;

beforeAll(async () => {
	iodd = readFileSync(__dirname + '/pressure.xml', 'utf-8')
    const result = await parseIODD(iodd)
    iodd_result = await convertIODD(result)
})

describe('Test IODD parsing', () => {
	it('Should transform an input through a filter', () => {
		console.log(iodd_result)
		const filter = createFilter(iodd_result.function.inputs.map((input) => {
			return input.struct.map((x) => ({...x.bits, name: x.name}))
		}).reduce((prev, curr) => prev.concat(curr), []), iodd_result.gradient ? parseFloat(iodd_result.gradient) : 1)
		const val = filter('FFD802000A00FE00')
		console.log(val)
	})
})