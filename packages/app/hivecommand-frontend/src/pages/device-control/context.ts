import React from 'react';

export const DeviceControlContext = React.createContext<{
	controlId?: string;
	program?: any;
	hmi?: any;
	values?: any[],
	hmiNodes?: any[],
	waitingForActions?: {id: string}[]
	groups?: any,
	changeDeviceMode?:any
	changeDeviceValue?:any
	performAction?: any;
	actions?: any[],
	operatingMode?: string,
	changeOperationMode?: (mode: string) => void,
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider