import { useContext } from 'react';
import React from 'react';

export const HMICanvasContext = React.createContext<{
	values?: {
		[key: string]: {
			[key: string]: any
		}
	}[],
	getDeviceOptions?: (device: string) => any
	getDeviceConf?: (device: string) => any;
}>({

})


export const HMICanvasProvider = (props: {children: any, value: {values?: any}}) => {
	
	const values = props.value?.values || [];

	return (
		<HMICanvasContext.Provider value={{
			...props.value,
			getDeviceOptions: (device) => {				
				
				return values?.[device];
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