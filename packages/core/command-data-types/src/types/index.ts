import { EdgeCondition } from './Condition'
import { ProgramInterlock } from './ProgramDevice'

export * from './process'
export * from './ProgramProcess'
export * from './Condition'
export * from './ProgramDevice'
export * from './ActionTypes'

export interface PayloadResponse {
	payload?: {
		command: CommandPayloadItem[],
		variables?: CommandVariable[],
		layout?: AssignmentPayload[],
		actions?: ActionPayload[]
	}
}

export interface CommandVariable {
	id: string;
	name: string;
	type: string;
	defaultValue: string;
}

export interface ActionPayload {
	id: string;
	name: string;
	flows: {
		id: string;
		name: string
	}[]
}

export interface CommandPayloadItem {
	
		name: string,
		id: string,
		parent: {
			id: string,
			name: string
		} | null,
		nodes: {
			id: string;
			type: string;
			configuration?: {
				key: string;
				value: string;
			}[];
			subprocess?: {
				id: string,
				name: string,
			}
			actions?: {
				key: string,
				target: string
				release?: boolean;
			}[],
			next: {
				target: string,
				id: string,
				sourceHandle: string,
				targetHandle: string,
				conditions?: EdgeCondition[]
			}[]
		}[]
	
}

export interface AssignmentPayload {
	actions?: {key: string, func: string}[]
	plugins?: {
		id: string,
		instance: any,
		plugin: {
			id: string,
			name: string,
			tick: string
		}
		rules: {id: string, name: string},
		configuration: {
			key: string,
			value: string
		}[]
	}[]
	interlocks?: ProgramInterlock[]
	state?: AssignmentState[]
	requiresMutex: boolean;
	type: string;
	port: string
	bus: string
	id: string
	name: string
}

// export interface ProgramDevice {
// 	name: string;
// 	requiresMutex?: boolean;
// 	actions?: {key: string, func: string}[], //e.g. start/stop
// 	state?: {key: string, type: string}[] //e.g. {key: "on", type: "boolean"}
// 	interlock?: {
// 		state: {[key: string]: any};
// 		locks: {
// 			device: string, 
// 			deviceKey: string, 
// 			comparator: string, 
// 			value: any, 
// 			fallback: string
// 		}[]
// 		// fallback: {operation: string, release?: boolean }[]
// 		// fallforward: {operation: string }[]
// 	}
// 	plugins?: {
// 		classString: string,
// 		imports?: {key: string, module: string}[],
// 		actions?: {key: string, func: string}[], //e.g. start/stop
// 		state?: {key: string, type: string}[] //e.g. {key: "speed", type: "number"}
// 		options?: {[key: string]: any};
// 		activeWhen?: string;
// 	}[]
// }

export interface AssignmentState {
	id: string;
	key: string;
	type: string;
	writable?: boolean;
	min?: number;
	max?: number;
	foreignKey: string;
}