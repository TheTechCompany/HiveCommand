import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HMITag } from "@hive-command/interface-types";
import { HMINode, HMITemplatePack } from ".";
import { transpile, ModuleKind, JsxEmit, ScriptTarget } from 'typescript'
import { template } from 'dot';
// import { baseRequirements } from '@hive-command/remote-components';
import { isEqual } from 'lodash';
import path from 'path';

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

const baseRequirements: any = {
    react: require('react'),
    '@mui/material': require('@mui/material'),
    '@mui/x-date-pickers': require('@mui/x-date-pickers'),
    '@mui/icons-material': require('@mui/icons-material'),
    '@hexhive/ui': require('@hexhive/ui')
}

const _require = (components: any[], parent?: string) => {
	return (name: string) => {


		if (name.indexOf('@module/components') > -1) {

			const component = name.split('@module/components/')?.[1]?.split('/')?.[0];

			const file = name.split(`@module/components/${component}/`)?.[1]

			const microRequire = (parent?: string) => (name: string) => {
				if (name in baseRequirements) {
					return baseRequirements[name];
				}

				let files = components.find((a) => a.name == component)?.files || [];


				const content = files.find((file) => {
					console.log(path.join(parent || '', '../', path.normalize(name), path.extname(file.path)))
					return path.normalize(file.path) == path.normalize(name) ||
						path.normalize(file.path) == (path.normalize(name) + path.extname(file.path)) ||
						path.normalize(file.path) == path.join(parent || '', '../', path.normalize(name)) ||
						path.normalize(file.path) == path.join(parent || '', '../', path.normalize(name) + path.extname(file.path)) ||
						path.normalize(file.path) == path.join(parent || '', '../', path.normalize(name), './index.js')
				}
				)?.content;


				const exports: {} = {};

				const module = { exports };

				const jsCode = 	transpile(content, { module: ModuleKind.CommonJS, esModuleInterop: true, jsx: JsxEmit.React })

				const func = new Function(
					"module",
					"exports",
					"require",
					jsCode);


				func(module, exports, microRequire(`${parent ? parent : ''}${name}`))

				return module.exports
			}


			const fileObj = components.find((a) => a.name == component)?.files?.find((a) => a.path == (file || components.find((a) => a.name == component).main?.path));

			const exports: {} = {};

			const module = { exports };

			const jsCode = transpile(fileObj.content, { module: ModuleKind.CommonJS, jsx: JsxEmit.React, esModuleInterop: true });


			const func = new Function(
				"module",
				"exports",
				"require",
				jsCode
				);

			func(module, exports, microRequire())

			return module.exports;
		}
		return baseRequirements[name];
	}
}

export const useNodesWithValues = (
	nodes: any[],
	tags: HMITag[],
	components: {
		id: string,
		name: string,
		files: { path: string, content: string }[]
	}[],
	functions: { showTagWindow: any, showWindow: any },
	values: any,
	updateValues: (values: any) => void
) => {

	const valueRef = useRef<{ values: any }>({ values })

	const [valueState, setValues] = useState<any>(values || {})

	useEffect(() => {
		if (values && !isEqual(values, valueRef.current.values)) {
			valueRef.current.values = values;
			setValues(values)
		}
	}, [JSON.stringify(values)])


	//Playground example
	const ref = useRef<{ abc: boolean }>({ abc: false });
	const [state, setState] = useState<any>({ abc: false });

	const nodeInputValues = useRef<{ values: any }>({ values: {} });
	const nodeOutputValues = useRef<{ values: any }>({ values: {} });
	const nodeTransformers = useRef<{ values: any }>({ values: {} });

	// console.log({nodeInputValues: nodeInputValues.current.values})

	useEffect(() => {

		nodes.forEach((node) => {

			let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

				let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value


				if (inputTemplate.type?.split(':')[0] === 'Tag') {
					let tag = tags?.find((a) => a.id === value)?.name
					if (!tag) return;

					let tagValue = values[tag];

					value = {
						tag,
						...(typeof (tagValue) === "object" && !Array.isArray(tagValue) ? tagValue : { value: tagValue })

						// ...values[ tag ]
					}
				}

				return {
					key: inputTemplate.name,
					value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
				}

			}).reduce((prev, curr) => ({ ...prev, ...(curr ? { [curr.key]: curr.value } : {}) }), {})

			let templateTransformers = (state: any) => {
				return node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

					let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value


					if (inputTemplate.type?.split(':')[0] === 'Tag') {
						let tag = tags?.find((a) => a.id === value)?.name
						if (!tag) return;

						let tagValue = state[tag];

						value = {
							tag,
							...(typeof (tagValue) === "object" && !Array.isArray(tagValue) ? tagValue : { value: tagValue })

							// ...values[ tag ]
						}
					}

					return {
						key: inputTemplate.name,
						value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
					}

				}).reduce((prev, curr) => ({ ...prev, ...(curr ? { [curr.key]: curr.value } : {}) }), {})
			}


			let templateOutputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

				let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value


				if (inputTemplate.type?.split(':')[0] === 'Tag') {
					let tag = tags?.find((a) => a.id === value)?.name

					return {
						key: inputTemplate.name,
						value: tag
					};
				}

				return null;

			}).filter((a) => a).reduce((prev, curr) => ({ ...prev, ...(curr ? { [curr.key]: curr.value } : {}) }), {})




			if (templateInputs) {
				nodeInputValues.current.values[node.id] = { ...templateInputs }

			}

			if (templateTransformers) {
				nodeTransformers.current.values[node.id] = templateTransformers
			}

			if (templateOutputs) {
				nodeOutputValues.current.values[node.id] = { ...templateOutputs }
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


		let values = Object.keys(node.extras?.options).map((optionKey) => {
			let optionValue = node?.options?.[optionKey]

			let parsedValue: any;

			try {
				// console.log({nodeValue: nodeInputValues.current.values[node.id]})
				parsedValue = getOptionValues(node, tags, components, functions, valueRef.current.values || {}, nodeInputValues.current, nodeTransformers.current, nodeOutputValues.current, updateValues, optionKey, optionValue)
			} catch (e) {
				console.error("error parsing value", { e, node, optionKey });
			}



			return { key: optionKey, value: parsedValue }

		}).reduce((prev, curr) => ({
			...prev,
			[curr.key]: curr.value
		}), {})

		return {
			...node,
			// options: values
			extras: {
				...node.extras,
				dataValue: values
			}
		}

	}), [JSON.stringify(valueRef.current.values), nodes, JSON.stringify(nodeInputValues.current.values), components])
}


export const getOptionValues = (
	node: HMINode,
	tags: HMITag[],
	components: {
		id: string,
		name: string,
		files: { path: string, content: string }[]
	}[],
	functions: { showTagWindow: any, showWindow: any },
	normalisedValues: any,
	templateValues: { values: { [key: string]: any } },
	templateTransformers: { values: { [key: string]: (state: any) => any } },
	templateOutputs: { values: { [key: string]: any } },
	setValues: (values: any) => void,
	optionKey: string,
	optionValue: any
) => {


	const templatedKeys = node.dataTransformer?.template?.outputs?.map((x) => x.name) || [];

	if (templatedKeys.indexOf(optionKey) > -1) {
		//Has templated override
		let templateOutput = node.dataTransformer?.template?.outputs?.[templatedKeys.indexOf(optionKey)];


		let templateOverride = node?.dataTransformer?.template?.edges?.find((a) => a.to.id == templateOutput?.id)?.script;

		// if(typeof(templateOverride) === 'string'){
		//     //Override is either literal or template
		// }else if(templateOverride.fn){
		//     //Override is function descriptor containing getter/setter
		// }


		//TODO make this run through the normal channel for options
		if (!templateOverride) {
			// console.error("no template override")
			return { key: optionKey, value: optionValue }
		}


		const exports: { getter?: (inputs: any) => void, setter?: () => void } | { handler?: (elem: any, values: any, setValues: (values: any) => void, args: any, transformer: ((state: any) => any)) => void } = {};

		const module = { exports };

		const func = new Function(
			"module",
			"exports",
			"showWindow",
			"showTagWindow",
			"React",
			"require",
			transpile(templateOverride, { module: ModuleKind.CommonJS, target: ScriptTarget.ES5, jsx: JsxEmit.React }));

		func(module, exports, (elem, data) => {
			return functions.showWindow(elem, (state: any) => {
				let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate) => {

					let value = node.dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value


					if (inputTemplate.type?.split(':')[0] === 'Tag') {
						let tag = tags?.find((a) => a.id === value)?.name
						if (!tag) return;

						let tagValue = state[tag];

						value = {
							tag,
							...(typeof (tagValue) === "object" && !Array.isArray(tagValue) ? tagValue : { value: tagValue })
						}
					}


					return {
						key: inputTemplate.name,
						value: value // node.dataTransformer?.configuration?.find((a) => a.field.id == inputTemplate.id)?.value
					}

				}).reduce((prev, curr) => ({ ...prev, ...(curr ? { [curr.key]: curr.value } : {}) }), {})

				// console.log({ templateInputs, dataTransformer: node.dataTransformer, state })

				return data(templateInputs)
			})
		}, functions.showTagWindow, baseRequirements['react'], _require(components));

		// console.log({templateInputs})

		let returnValue: any;


		if ('handler' in exports) {
			//onClick uses a handler to setup showWindow, the values are bound to templateValues at that point in time
			returnValue = (...args: any[]) => exports?.handler?.({ x: node.x, y: node.y, width: node.width, height: node.height }, templateValues.values[node.id] || {}, (state: any) => {

				let rectifiedState: any = {};

				let keys = Object.keys(state)

				keys.forEach((key) => {
					if (templateOutputs.values[node.id]?.[key]) {
						rectifiedState[templateOutputs.values[node.id][key]] = state[key]
					}
				})

				setValues(rectifiedState)
				//TODO map this state back over the template input to create a real state update
				// console.log("setState", state)

			}, args, (state) => {
				return templateTransformers?.values?.[node.id]?.(state)
			})
		} else if ('getter' in exports) {
			returnValue = exports?.getter?.(templateValues.values[node.id] /*normalisedValues*/);
		}

		// console.log("Template return value", optionKey, returnValue, templateValues.values[node.id])

		// const


		return returnValue
	} else {
		// let optionValue = node.options?.[optionKey];


		if (typeof (optionValue) === 'string' && optionValue?.indexOf('script://') > -1) {

			const exports: { getter?: (inputs: any) => void, setter?: () => void } | { handler?: (elem: any, values: any, setValues: (values: any) => void, args: any) => void } = {};

			const module = { exports };

			const func = new Function(
				"module",
				"exports",
				"showWindow",
				"showTagWindow",
				"React",
				"require",
				transpile(optionValue.replace('script://', ''), { module: ModuleKind.CommonJS, target: ScriptTarget.ES5, jsx: JsxEmit.React }));



			func(module, exports, functions.showWindow, functions.showTagWindow, React, _require(components));

			if ('getter' in exports) {
				const val = exports?.getter?.(normalisedValues);
				return val;
			}

			if ('handler' in exports) {
				return (...args: any[]) => exports?.handler?.({ x: node.x, y: node.y, width: node.width, height: node.height }, normalisedValues || {}, (state: any) => { console.log("setState", state); setValues(state); }, args)
			}

		} else if (typeof (optionValue) === 'string' && optionValue?.match(/{{.*}}/) !== null) {
			// let templateString : string = node.options[key];
			let templateString = optionValue.replaceAll(/{{\s*(.*)\s*}}/g, "{{= it.$1 }}")
			//Replace {{}} with {{ it.${matched} }}

			try {
				// console.log({varname, tmpl: x.options[key], values})

				return template(templateString)(normalisedValues /*values*/)
			} catch (e) {
				console.error(e)

				return optionValue;
			};
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
		let base: any = url.split('/');
		let [url_slug] = base.splice(base.length - 1, 1)
		base = base.join('/');

		const pack = await getPack(packId, `${base}/`, url_slug)

		return pack.find((a: any) => a.name == templateName)?.component

	}

	return (<div>no icon found</ div >);
	// return pack
}