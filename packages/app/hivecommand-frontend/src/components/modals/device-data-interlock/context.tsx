import React from 'react';


export interface DeviceDataInterlock {
	inputDevice?: string,
	inputDeviceKey?: string,
	comparator?: string,
	assertion?: {
		type?: string,
		setpoint?: string,
		variable?: string,
		value?: string
	},
	deviceKey?: string
}
export const DeviceInterlockContext = React.createContext<{
	device?: any,
	devices?: any[],
	actions?: any[],
	variables?: any[],
	interlock?: DeviceDataInterlock,
	setInterlock?: (interlock: DeviceDataInterlock) => void
}>({

})

export const DeviceInterlockProvider = DeviceInterlockContext.Provider