import vm from 'vm';



	export const getPluginFunction = (func: string) : ((instance: any, state: any, updateState: (state: any) => void) => Promise<any>)=> {
		return vm.runInNewContext(`
			const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
			new AsyncFunction(
				'instance',
				'state',
				'updateState',
				func
			)
		`, {
			func: func,
			setTimeout,
			setInterval
		})
	}

	export const getDeviceFunction = (func_desc: string) => {
		const func = vm.runInNewContext(`
			const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
			new AsyncFunction(
				'state',
				'setState',
				'requestState',
				func
			)
		`, {
			func: func_desc,
			setTimeout
		})
		return func;
	}


