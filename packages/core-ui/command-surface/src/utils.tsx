import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HMINode, HMITemplatePack } from ".";
import { transpile, ModuleKind, JsxEmit } from 'typescript'
import { template } from 'dot';

export interface DevicePlaceholder {
	tag: string,

	setpoints?: {
		id: string;
		name: string;
		type: string;

	}[]
	type?: {
		tagPrefix?: string
		state?: {
			key: string;
		}[]
		actions?: {
			key: string;
			func?: string;
		}[]
	}
}

export const getDevicesForNode = (node: any): DevicePlaceholder[] => {
	if (node.children && node.children.length > 0) {
		return node.children?.map((x: any) => ({ ...x.devicePlaceholder }))
	} else {
		return [node?.devicePlaceholder];
	}
}

export const useNodesWithValues = (nodes: any[], devices: any[], functions: {showDeviceWindow: any, showWindow: any}, values: any) => {

	const valueRef = useRef<{values: any}>({values})

	const [ valueState, setValues ] = useState<any>(values || {})

	useEffect(() => {
		if(values){
			valueRef.current.values = values;
			setValues(values)
		}
	}, [values])


	//Playground example
	const ref = useRef<{abc: boolean}>({abc: false});
	const [ state, setState ] = useState<any>({abc: false});

	const nodeInputValues = useRef<{values: any}>({values: {}});

	// console.log({nodeInputValues: nodeInputValues.current.values})

	useEffect(() => {

		console.log("Parse nodes", nodes);

		nodes.forEach((node) => {

			let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

				let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value
	
				console.log({inputTemplate});
	
				if(inputTemplate.type?.split(':')[0] === 'Device'){
					let tag = devices?.find((a) => a.id === value).tag 
					value = {
						tag,
						...values[ tag ]
					}
				}
	
				return {
					key: inputTemplate.name, 
					value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
				}
	
			}).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})


			if(templateInputs){
				nodeInputValues.current.values[node.id] = {...templateInputs}

				console.log({templateInputs, id: node.id, nodeInputValues: nodeInputValues.current.values[node.id]});
			}
		})
		
	}, [values, nodes])



	// useEffect(() => {
	// 	const exports : { handler?: (values: any) => void }= {};

	// 	const module = { exports };

	// 	console.log({trans: transpile(`export const handler = (values: any) => {
	// 		setInterval(() => {
	// 			showWindow(() => ({asdf: values}))
	// 		}, 2000)
	// 	}`, {kind: ModuleKind.CommonJS})})

	// 	const fn = new Function("module", "exports", "showWindow", transpile(`export const handler = (values: any) => {
	// 		showWindow(() => ({asdf: values}))
	// 	}`, {kind: ModuleKind.CommonJS}))
		
	// 	fn(module, exports, (fn) => {
	// 		setInterval(() => {
	// 			console.log({fnFun: fn()})
	// 		}, 2000)
	// 	})
		
	// 	exports?.handler?.(ref.current)

	// 	setInterval(() => { 
	// 		ref.current.abc = !ref.current.abc;

	// 		// setState((s) => ({abc: !s.abc}) )
	// 		console.log({fnFun2: ref.current})
	// 	}, 5000)
	// }, [])



	
	return useMemo(() => nodes.map((node) => {

		console.log({node});

		let values = Object.keys(node.extras?.options).map((optionKey) => {
			let optionValue = node?.options?.[optionKey]
			
			let parsedValue : any;

			try{
				// console.log({nodeValue: nodeInputValues.current.values[node.id]})
				parsedValue = getOptionValues(node, devices, functions, valueRef.current.values || {}, nodeInputValues.current, optionKey, optionValue)
			}catch(e){
				console.log({e, node, devices, optionKey});
			}

			console.log({optionKey, parsedValue});

			return {key: optionKey, value: parsedValue}

		}).reduce((prev, curr) => ({
			...prev,
			[curr.key]: curr.value
		}), {})

		console.log({id: node.id, values});

		return {
			...node,
			// options: values
			extras: {
				...node.extras,
				dataValue: values
			}
		}

	}), [JSON.stringify(valueRef.current.values), nodes, JSON.stringify(nodeInputValues.current.values)])
}


export const getOptionValues = (node: HMINode, devices: any[], functions: {showDeviceWindow: any, showWindow: any}, normalisedValues: any, templateValues: {values: {[key: string]: any}}, optionKey: string, optionValue: any) => {
    
	console.log(node.id, {templateValues});

    const templatedKeys = node.dataTransformer?.template?.outputs?.map((x) => x.name) || [];

	if(templatedKeys.indexOf(optionKey) > -1){
		//Has templated override
		let templateOutput = node.dataTransformer?.template?.outputs?.[templatedKeys.indexOf(optionKey)];

		console.log("Templating", optionKey)
		// let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

		// 	let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value

		// 	console.log({inputTemplate});

		// 	if(inputTemplate.type?.split(':')[0] === 'Device'){
		// 		value = normalisedValues[ devices?.find((a) => a.id === value).tag ];
		// 	}

		// 	return {
		// 		key: inputTemplate.name, 
		// 		value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
		// 	}

		// }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})


		// node.dataTransformer?.configuration

		// console.log({templateInputs})

		let templateOverride = node?.dataTransformer?.template?.edges?.find((a) => a.to.id == templateOutput?.id)?.script;
		
		// if(typeof(templateOverride) === 'string'){
		//     //Override is either literal or template
		// }else if(templateOverride.fn){
		//     //Override is function descriptor containing getter/setter
		// }

	
		//TODO make this run through the normal channel for options
		if(!templateOverride) {
			console.error("no template override")
			return {key: optionKey, value: optionValue }
		}

		console.log(templateOverride)

		const exports : {getter?: (inputs: any) => void, setter?: () => void } | { handler?: (elem: any, values: any) => void }= {};

		const module = { exports };
		const func = new Function(
			"module", 
			"exports", 
			"showWindow", 
			"showDeviceWindow",
			"React",
			transpile(templateOverride, { module: ModuleKind.CommonJS, jsx: JsxEmit.React }) );

		func(module, exports, (elem, data) => {
			return functions.showWindow(elem, (state: any) => {
				let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

					let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value
		
		
					if(inputTemplate.type?.split(':')[0] === 'Device'){
						let tag = devices?.find((a) => a.id === value).tag 
						value = {
							tag,
							...state[ tag ]
						}
					}

					console.log({inputTemplate, state});
		
					return {
						key: inputTemplate.name, 
						value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
					}
		
				}).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})
	
	
				
				return  data(templateInputs)
			})
		}, functions.showDeviceWindow, React);

		// console.log({templateInputs})

		let returnValue: any;

		console.log(node.id, {exports})
		
		if('handler' in exports){
			console.log("HANDLER", node.id, templateValues.values[node.id]);
			//onClick uses a handler to setup showWindow, the values are bound to templateValues at that point in time
			returnValue = () => exports?.handler?.({x: node.x, y: node.y, width: node.width, height: node.height}, templateValues.values[node.id] || {})
		}else if('getter' in exports){
			returnValue = exports?.getter?.( templateValues.values[node.id] /*normalisedValues*/ );
		}

		// const

		console.log("Templated key", optionKey, normalisedValues, returnValue)

		return returnValue
	}else{
		// let optionValue = node.options?.[optionKey];


		if (typeof(optionValue) === 'string' && optionValue?.match(/{{.*}}/) !== null) {
			// let templateString : string = node.options[key];
			let templateString = optionValue.replaceAll(/{{\s*(.*)\s*}}/g, "{{= it.$1 }}")
			//Replace {{}} with {{ it.${matched} }}
			console.log({nodeOptions:templateString, normalisedValues})

			try {
				// console.log({varname, tmpl: x.options[key], values})

				return template(templateString)(normalisedValues /*values*/)
			} catch (e) {
				return optionValue;
			};
		} else if(typeof(optionValue) === 'string' && optionValue?.indexOf('script://') > -1){

			optionValue = optionValue.match(/script:\/\/(.*)/s)?.[1];

			console.log("Option route script", optionValue);

			const exports : { handler?: (elem: any, state: any) => void } = {};
			const module = { exports };
			const func = new Function("module", "exports", "showWindow", "showDeviceWindow", transpile(optionValue, {kind: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX}) );
			func(module, exports, functions.showWindow, functions.showDeviceWindow);

			return exports?.handler?.bind(this, {x: node.x, y: node.y, width: node.width, height: node.height}, normalisedValues || {})

		} else {
			return optionValue;
		}

		// if(typeof(optionValue) === 'string'){
		// 	//Is either literal or template string
		// 	if(optionValue.match(/{{=.*}}/) != null){
		// 		try{
		// 			//Try template the optionValue and apply values object to it
		// 			//Caveats
		// 			//1. All string values will get templated
		// 			//2. Values could be incomplete / Circular request
		// 			return {key: optionKey, value: template(optionValue || '')({valve: {on: false}})}
		// 		}catch(e){
		// 			return {key: optionKey, value: optionValue}
		// 		}
		// 	}
			
		// 	return {key: optionKey, value: optionValue}
		// }else{
		// 	//Is function
		// 	const exports : { handler?: () => void }= {};
		// 	const module = { exports };
		// 	const func = new Function("module", "exports", transpile(optionValue.fn, {kind: ModuleKind.CommonJS}) );
		// 	func(module, exports);

		// 	return { key: optionKey, value: exports?.handler?.() };
		// }
	}

}  


export const getNodePack = async (type: string, templatePacks: HMITemplatePack[], getPack?: any) => {
	const [packId, templateName] = (type || '').split(':')
	const url = templatePacks?.find((a) => a.id == packId)?.url;


	if (url) {
		let base : any = url.split('/');
		let [url_slug] = base.splice(base.length - 1, 1)
		base = base.join('/');

		const pack = await getPack(packId, `${base}/`, url_slug)

		console.log("Found pack", pack)

		return pack.find((a: any) => a.name == templateName)?.component
		
	}

	return (<div>no icon found</ div >);
        // return pack
}