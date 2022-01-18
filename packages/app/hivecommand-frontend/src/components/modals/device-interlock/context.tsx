import React from 'react';
import { JsonTree } from 'react-awesome-query-builder';
import { DeviceInterlock } from '.';


export interface DeviceInterlock {
	inputDevice?: string,
	inputDeviceKey?: string,
	comparator?: string,
	assertion?: {
		setpoint?: string,
		value?: string
	},
	state?: {id?: string, deviceKey: string, deviceValue: any }[],
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