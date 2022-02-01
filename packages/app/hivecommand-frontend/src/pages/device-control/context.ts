import React from 'react';

export const DeviceControlContext = React.createContext<{
	controlId?: string;
	program?: any;
	hmi?: any;
	values?: any[],
	reporting?: any[],
	hmiNodes?: any[],
	waitingForActions?: {id: string}[]
	groups?: any,
	changeDeviceMode?:any
	changeDeviceValue?:any
	performAction?: any;
	actions?: any[],
	operatingMode?: string,
	operatingState?: string,
	changeOperationState?: (state: "on" | "off" | "standby") => void;
	changeOperationMode?: (mode: string) => void,
	refresh?: () => void;
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider