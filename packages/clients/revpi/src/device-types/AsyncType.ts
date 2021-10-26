import vm from 'vm';

(async () => {


	let getDriverFunction = (func_desc: string) => {
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

	const driver = getDriverFunction(`
		setState({opening: true});
		requestState(false);
		await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000));
		setState({opening: false, open: false});
		`)
	console.log(driver)

	driver({open: true, opening: false}, (obj: any) => console.log("Set ", obj), (state: any) => console.log("request", state)).then(() => {
		console.log("Done")
	})

})()