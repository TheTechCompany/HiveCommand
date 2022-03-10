import React from 'react';
import { DeviceInterlock } from '.';


export interface DeviceInterlock {
	inputDevice?: string,
	inputDeviceKey?: string,
	comparator?: string,
	assertion?: {
		setpoint?: string,
		value?: string
	},
	state?: {id?: string, device: string, deviceKey: string, comparator: string, assertion: any }[],
	valueType?: string,
	action?: string
}
export const DeviceInterlockContext = React.createContext<{
	device?: any,
	devices?: any[],
	actions?: any[]
	interlock?: DeviceInterlock,
	setInterlock?: (interlock: DeviceInterlock) => void
}>({

})

export const DeviceInterlockProvider = DeviceInterlockContext.Provider