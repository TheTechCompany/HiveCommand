import { CommandProgram, CommandProgramDevicePlaceholder, CommandProgramHMI } from '@hive-command/api';
import React from 'react';
<<<<<<< HEAD
import { CommandSurfaceClient } from '.';
=======
>>>>>>> eb8888c5dd1d1eaa539ffc76f77cf8102b241cc0
import { RemoteComponentCache } from './hooks/remote-components';

export const DeviceControlContext = React.createContext<{
	// controlId?: string;
	// device?: any;

	values?: {[key: string]: {[key: string]: any}}

<<<<<<< HEAD
	// sendAction?: (type: string, action: any) => void;
	setView?: (view: string) => void;

	// seekValue?: (startDate: Date, endDate: Date) => any[];

	client?: CommandSurfaceClient;
=======
	sendAction?: (type: string, action: any) => void;
	setView?: (view: string) => void;

	seekValue?: (startDate: Date, endDate: Date) => any[];
>>>>>>> eb8888c5dd1d1eaa539ffc76f77cf8102b241cc0

	cache?: RemoteComponentCache;

	program?: {
		id: string;
		interface: CommandProgramHMI,
		variables: any[],
<<<<<<< HEAD
		devices: {
			id: string;
			tag: string;
			type: {
				tagPrefix: string;
				state: any[]
			}
		}[]
=======
		devices: CommandProgramDevicePlaceholder[]
>>>>>>> eb8888c5dd1d1eaa539ffc76f77cf8102b241cc0
	};
	
	alarms?: any[];

	watching?: {id: string, name: string}[];
	hmis?: any;
	functions?: any[];

	historize?: boolean;
	
	defaultPage?: string;
	activePage?: string;
	templatePacks?: any[];

<<<<<<< HEAD
	reports?: {
		id: string;
		charts: {x: number, y: number, w: number, h: number, label: string, values: {timestamp: Date, value: any}[] }[]
	}[];
=======
	reporting?: any[],
	hmiNodes?: any[],
	groups?: any,
>>>>>>> eb8888c5dd1d1eaa539ffc76f77cf8102b241cc0
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