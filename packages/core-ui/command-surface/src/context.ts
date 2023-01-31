import { CommandProgram, CommandProgramDevicePlaceholder, CommandProgramHMI } from '@hive-command/api';
import React from 'react';
import { CommandSurfaceClient, HMIDevice, HMINode, HMIProgram, HMIView } from '.';
import { RemoteComponentCache } from './hooks/remote-components';

export const DeviceControlContext = React.createContext<{
	// controlId?: string;
	// device?: any;

	infoTarget?: any;
	setInfoTarget?: any;
	
	values?: {[key: string]: {[key: string]: any}}

	// sendAction?: (type: string, action: any) => void;
	setView?: (view: string) => void;

	// seekValue?: (startDate: Date, endDate: Date) => any[];

	client?: CommandSurfaceClient;

	cache?: RemoteComponentCache;

	program?: {
		id?: string,
		interface: HMIView
		//  {
		// 	nodes: HMINode[]
		// },
		devices: HMIDevice[]
	};
	
	alarms?: any[];

	watching?: {id: string, name: string}[];
	hmis?: any;
	functions?: any[];

	historize?: boolean;
	
	defaultPage?: string;
	activePage?: string;
	templatePacks?: any[];

	reports?: {
		id: string;
		charts: {x: number, y: number, w: number, h: number, label: string, values: {timestamp: Date, value: any}[] }[]
	}[];
	changeDeviceMode?:any
	changeDeviceValue?:any
	actions?: any[],
	
	changeOperationState?: (state: "on" | "off" | "standby") => void;
	changeOperationMode?: (mode: string) => void,
	refresh?: () => void;
	refetch?: () => void;
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider