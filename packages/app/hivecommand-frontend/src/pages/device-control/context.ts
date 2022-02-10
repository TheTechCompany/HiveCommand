import React from 'react';

export const DeviceControlContext = React.createContext<{
	controlId?: string;
	device?: any;
	program?: any;
	hmi?: any;
	reporting?: any[],
	hmiNodes?: any[],
	groups?: any,
	changeDeviceMode?:any
	changeDeviceValue?:any
	performAction?: any;
	actions?: any[],
	changeOperationState?: (state: "on" | "off" | "standby") => void;
	changeOperationMode?: (mode: string) => void,
	refresh?: () => void;
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider