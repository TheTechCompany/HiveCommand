import { createFilter, IODDBits } from "../src";

const bits : IODDBits[] = [
	{
		name: "Current",
		type: "IntegerT",
		subindex: `1`,
		offset: `16`,
		length: `16`
	},
	{
		name: "Device Status",
		type: "BooleanT",
		offset: "0",
		subindex: "2"
	}
]
const filter = createFilter(bits)

console.log(filter(""))