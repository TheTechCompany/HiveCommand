
import React, { useMemo, useEffect, useRef, useState } from 'react'
import { HMITag } from '../HMITag'
import { template } from 'dot';
import { 
    ModuleKind,
    ScriptTarget,
    JsxEmit,
    transpile
} from 'typescript'
import path from 'path';
import { Node } from 'reactflow';
import { isEqual, merge } from 'lodash'
import { DataTransformer } from '../DataTransformer';

export * from './useNodesWithValues'

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


				const content = files.find((file: any) => {
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

			const fileComponent = components.find((a) => a.name == component);

			const defaultFile = fileComponent?.files?.find((a: any) => a.path == 'index.tsx') || 
				fileComponent?.files?.find((a: any) => a.path == 'index.ts') ||
				fileComponent?.files?.find((a: any) => a.path == 'index.js')

			const fileObj = fileComponent?.files?.find((a: any) => {
				if(file || fileComponent?.main?.path)
					return a.path == (file || fileComponent?.main?.path)
				return a.path == defaultFile?.path
			});

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

export const getOptionValues = (
	node: {
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        dataTransformer?: DataTransformer,
    },
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



	const templatedKeys = node.dataTransformer?.template?.outputs?.map((x: any) => x.name) || [];

	if (templatedKeys.indexOf(optionKey) > -1) {
		//Has templated override
		let templateOutput = node.dataTransformer?.template?.outputs?.[templatedKeys.indexOf(optionKey)];

		let templateOverride = node?.dataTransformer?.template?.edges?.find((a: any) => a?.to?.id == templateOutput?.id)?.script;


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

		const func : (
            module: {exports: any}, 
            exports : {getter?: any, setter?: any} | {handler?: ((elem: any, values: any, setValues: any, args: any, transformer: any) => void) },
            showWindow: (elem : any, data: any) => void,
            showTagWindow: any,
            React: any,
            require: any
        ) => void = new Function(
			"module",
			"exports",
			"showWindow",
			"showTagWindow",
			"React",
			"require",
			transpile(templateOverride, { module: ModuleKind.CommonJS, target: ScriptTarget.ES5, jsx: JsxEmit.React })) as any;

		func(module, exports, (elem, data) => {
			return functions.showWindow(elem, (state: any) => {

				let templateInputs = node.dataTransformer?.template?.inputs?.map((inputTemplate : {id: string, type: string, name: string}) => {

					// const configuration = node.
					let value = (node.dataTransformer?.configuration || []).length > 0 ? node.dataTransformer?.configuration?.find((a: any) => a.field.id === inputTemplate.id)?.value : node.dataTransformer?.options?.[inputTemplate.id]

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

				})
				
				let input = (templateInputs || [] as any).reduce((prev : {key: string, value: any}, curr : {key: string, value: any}) => ({ ...prev, ...(curr ? { [curr.key]: curr.value } : {}) }), {})

				// console.log({ templateInputs, dataTransformer: node.dataTransformer, state })

				return data(input)
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


