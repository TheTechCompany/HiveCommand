import { useMemo, useRef, useState, useEffect } from "react"
import { Node } from 'reactflow';
import { HMITag } from "../HMITag";
import { DataTransformer } from "../DataTransformer";
import { isEqual, merge } from 'lodash';
import { getOptionValues } from ".";

export const useNodesWithValues = (
	nodes: Node[],
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


	const [ inputValues, setInputValues ] = useState<any>({});
	const [ outputValues, setOutputValues ] = useState<any>({});
	const [ transformers, setTransformers ] = useState<any>({});


	// console.log({nodeInputValues: nodeInputValues.current.values})


	useEffect(() => {


		nodes.forEach((node) => {
			const dataTransformer : DataTransformer = node.data?.dataTransformer;


			const configuration = node.data?.templateOptions;

			
			let templateInputs = dataTransformer?.template?.inputs?.map((inputTemplate) => {

				let value = (dataTransformer?.configuration || []).length > 0 ? dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value : configuration?.[inputTemplate.id]


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
				return dataTransformer?.template?.inputs?.map((inputTemplate) => {

					let value = (dataTransformer?.configuration || []).length > 0 ? dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value : configuration?.[inputTemplate.id]


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

			let templateOutputs = dataTransformer?.template?.inputs?.map((inputTemplate) => {

				let value = (dataTransformer?.configuration || []).length > 0 ? dataTransformer?.configuration?.find((a) => a.field.id === inputTemplate.id)?.value : configuration?.[inputTemplate.id];


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
				// nodeInputValues.current.values[node.id] = { ...templateInputs }
				setInputValues((iv: any) => {
					let inputValues = Object.assign({}, iv);
					inputValues[node.id] = templateInputs;
					return inputValues;
				})
			}

			if (templateTransformers) {
				// nodeTransformers.current.values[node.id] = templateTransformers
				setTransformers((iv: any) => {
					let inputValues = Object.assign({}, iv);
					inputValues[node.id] = templateTransformers;
					return inputValues;
				})
			}

			if (templateOutputs) {
				// nodeOutputValues.current.values[node.id] = { ...templateOutputs }
				setOutputValues((iv: any) => {
					let inputValues = Object.assign({}, iv);
					inputValues[node.id] = templateOutputs;
					return inputValues;
				})
			}
		})

	}, [JSON.stringify(values), JSON.stringify(nodes) ])



	const nodeValues = useMemo(() => nodes.map((node) => {

		//node.extras.options
		let values = Object.keys(node?.data?.options).map((optionKey) => {
			let optionValue = node?.data?.configuredOptions?.[optionKey]

			let parsedValue: any;

			try {

				// console.log({nodeValue: nodeInputValues.current.values[node.id]})
				parsedValue = getOptionValues({
					id: node.id,
					x: node.position.x,
					y: node.position.y,
					width: node.data?.width,
					height: node.data?.height,
					dataTransformer: {
						...node.data?.dataTransformer,
						options: node.data?.templateOptions
					}
				}, 
				tags, 
				components, 
				functions, 
				valueState || {}, 
				{values: inputValues}, 
				{values: transformers}, 
				{values: outputValues},
				updateValues, 
				optionKey, 
				optionValue)

			} catch (e) {
				console.error("error parsing value", { e, node, optionKey });
			}



			return { key: optionKey, value: parsedValue }

		}).reduce((prev, curr) => ({
			...prev,
			[curr.key]: curr.value
		}), {})

		return merge({}, node, {
			data: {
				dataValue: values
			}	
		})



	}), [ 
		JSON.stringify(transformers), 
		JSON.stringify(outputValues), 
		JSON.stringify(nodes), 
		JSON.stringify(valueState),  
		JSON.stringify(inputValues), 
		components])

	return nodeValues;
}
