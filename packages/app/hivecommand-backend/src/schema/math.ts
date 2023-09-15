import { unit } from 'mathjs'

const mathUnit = unit('m3/hr')
const secondUnit = mathUnit.to('m3 / s');
const thirdUnit = unit('l/s');

console.log(unit(mathUnit.units[1].unit.name).toNumber('minutes'));
