import { nanoid } from 'nanoid';
import vm from 'vm';

//		const PIDController = require("node-pid-controller");

/*

*/



export const getPluginClass = (classString: string, imports?: {key: string, module: string}[]) => {

	const classConstructor = vm.runInNewContext(
	`
		${imports?.map((imp) => {
			return `const ${imp.key} = require("${imp.module}");`
		}).join(`\n`)}

		class PluginClass {
			${classString}
		}
		PluginClass
	`, {
		require: require,
		setTimeout,
		setInterval,
		console,
		nanoid
	})

	return classConstructor
}