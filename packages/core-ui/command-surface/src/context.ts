import { CommandProgram, CommandProgramDevicePlaceholder, CommandProgramHMI } from '@hive-command/api';
import React from 'react';
import { RemoteComponentCache } from './hooks/remote-components';

export const DeviceControlContext = React.createContext<{
	controlId?: string;
	device?: any;

	cache?: RemoteComponentCache;
	
	program?: {
		id: string;
		interface: CommandProgramHMI,
		variables: any[],
		devices: CommandProgramDevicePlaceholder[]
	};
	
	alarms?: any[];

	watching?: {id: string, name: string}[];
	hmis?: any;
	functions?: any[];

	historize?: boolean;
	
	defaultPage?: string;
	activePage?: string;
	templatePacks?: any[];

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
	refetch?: () => void;
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider