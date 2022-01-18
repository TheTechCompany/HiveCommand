import vm from 'vm';
import { StateDevice } from '.';

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
		console
	})

	return classConstructor
}