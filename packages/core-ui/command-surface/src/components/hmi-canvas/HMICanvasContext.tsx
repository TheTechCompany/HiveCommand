import { useContext } from 'react';
import React from 'react';

export const HMICanvasContext = React.createContext<{
	values?: {
		placeholder: string;
		key: string;
		value: any;
		// conf: {
        //     device: {id: string},
        //     deviceKey: {key: string}, 
        //     min: any,
		// 	max: any
        // }[], 
		// devicePlaceholder?: {
		// 	name: string
		// 	type?: {
		// 		state?: {
		// 			key: string,
		// 			units?: string;
		// 			inputUnits?: string;
		// 			modifiers: string[]
		// 		}[]
		// 	}
		// }
		// values: any
	}[],
	getDeviceOptions?: (device: string) => any
	getDeviceConf?: (device: string) => any;
}>({

})


export const HMICanvasProvider = (props: {children: any, value: {values?: {placeholder: string, key: string, value: any}[]}}) => {
	
	const values = props.value?.values || [];

	return (
		<HMICanvasContext.Provider value={{
			...props.value,
			getDeviceOptions: (device) => {				
				// `${a.devicePlaceholder?.type?.tagPrefix || ''}${a.devicePlaceholder?.tag}` 
				let deviceValues = values.filter((a) => a.placeholder == device);
				// return deviceValues?.values;
				let vals = deviceValues.reduce((prev, curr) => ({
					...prev,
					[curr.key]: curr.value
				}), {}) 
				//Object.assign({}, deviceValues || {});
				
				// for(var k in vals){
				// 	let state = deviceValues.devicePlaceholder?.type?.state?.find((a: any) => a.key == k);

				// 	let units = deviceValues.devicePlaceholder?.units?.find((a: any) => a.state?.key == k)
				// 	// if(state.inputUnits == "Pa") vals[k] = 65;
				// 	// if(state.inputUnits && state.units && state.inputUnits != state.units){
					
				// 	// 	let newUnit = unit(vals[k], state.inputUnits).to(state.units);
				// 	// 	console.log({state}, vals[k], newUnit)

				// 	// 	vals[k] =  `${newUnit.toNumber().toFixed(2)} ${newUnit.formatUnits()}`//`${vals[k]} ${state.inputUnits} to ${state.units}`)
				// 	if(units?.inputUnit || units?.displayUnit || state.units){
				// 		vals[k] = `${vals[k]} ${units?.displayUnit || units?.inputUnit || state.units}`
				// 	}
				// }

				// 	let mods = deviceValues.devicePlaceholder?.type.state.find((a) => a.key == k).modifiers || []
				// 	console.log(mods)
				// 	if(mods.length > 0){
				// 		vals[k] = modify(vals[k], mods)
				// 	}
				// }
				return vals;
			},
			getDeviceConf: (device) => {

				// return values.find((a: any) => `${a.devicePlaceholder?.type?.tagPrefix || ''}${a.devicePlaceholder?.tag}` == device)?.conf?.reduce((prev: any, curr: any) => ({
				// 	...prev,
				// 	[curr?.deviceKey?.key]: {
				// 		min: curr?.min,
				// 		max: curr?.max
				// 	}
				// }), {} as any)

				return {} //values.find((a) => a.devicePlaceholder?.name == device)?.conf?.reduce((prev, curr) => ({...prev, [curr.key]: {min: curr.min, max: curr.max}}), {}) || {};
			}
		}}>
			{props.children}
		</HMICanvasContext.Provider>
	)

};