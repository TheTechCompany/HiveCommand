import React from 'react';
import { CommandSurfaceClient, HMIProgram } from '.';
import { RemoteComponentCache } from '@hive-command/remote-components';
import { ReportChart } from './views/analytics';

export const DeviceControlContext = React.createContext<{
	// controlId?: string;
	// device?: any;

	infoTarget?: { 
		x?: number, 
		y?: number, 
		width?: number, 
		height?: number, 
		dataFunction?: (state: any) => any 
	};
	setInfoTarget?: any;
	
	values?: {[key: string]: {[key: string]: any} | any}

	// sendAction?: (type: string, action: any) => void;
	setView?: (view: string) => void;

	// seekValue?: (startDate: Date, endDate: Date) => any[];

	client?: CommandSurfaceClient;

	cache?: RemoteComponentCache;

	activeProgram?: HMIProgram & any

	// program?: {
	// 	id?: string,
	// 	interface?: HMIView
	// 	//  {
	// 	// 	nodes: HMINode[]
	// 	// },
	// 	tags?: HMITag[]
	// 	types?: HMIType[]
	// };
	
	alarms?: any[];

	watching?: {id: string, name: string}[];
	hmis?: any;
	functions?: any;

	historize?: boolean;
	
	defaultPage?: string;
	activePage?: string;
	templatePacks?: any[];

	analytics?: {
		id: string;
		charts: ReportChart[] //{x: number, y: number, width: number, height: number, label: string, values: {timestamp: Date, value: any}[] }[]
	}[];

	reports?: {
		id: string,
		name: string,
		startDate: Date,
		endDate?: Date,
		reportLength?: string,
		recurring?: boolean,
		createdAt?: Date,
		instances?: {
			done: boolean,
			createdAt: Date,
			startDate: Date,
			endDate: Date,
			url: string
		}[],
		fields?: {
			id: string,
			device: any,
			key: any,
			bucket: string,
			createdAt: Date,
		}[]
	}[];

	changeDeviceMode?:any
	actions?: any[],
	
	changeOperationState?: (state: "on" | "off" | "standby") => void;
	changeOperationMode?: (mode: string) => void,
	refresh?: () => void;
	refetch?: () => void;
}>({

})

export const DeviceControlProvider = DeviceControlContext.Provider