import React from 'react';
import { DeviceInterlock } from '.';


export interface DeviceInterlock {
	inputDevice?: string,
	inputDeviceKey?: string,
	comparator?: string,
	assertion?: {
		type?: string,
		setpoint?: string,
		variable?: string,
		value?: string
	},
	state?: {id?: string, device: string, deviceKey: string, comparator: string, assertion: any }[],
	action?: string
}
export const DeviceInterlockContext = React.createContext<{
	device?: any,
	devices?: any[],
	actions?: any[],
	variables?: any[],
	interlock?: DeviceInterlock,
	setInterlock?: (interlock: DeviceInterlock) => void
}>({

})

export const DeviceInterlockProvider = DeviceInterlockContext.Provider