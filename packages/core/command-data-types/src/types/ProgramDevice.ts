import { EdgeCondition } from "./Condition";

export interface ProgramInterlock extends EdgeCondition {

	action: string
}

export interface ProgramDataInterlock extends EdgeCondition {
	deviceKey: string;
}

export interface ProgramDevice {
	name: string;
	requiresMutex?: boolean;
	actions?: {key: string, func: string}[], //e.g. start/stop
	state?: {key: string, type: string}[] //e.g. {key: "on", type: "boolean"}
	interlock?: {
		state: {[key: string]: any};
		locks: ProgramInterlock[]
		// fallback: {operation: string, release?: boolean }[]
		// fallforward: {operation: string }[]
	}
	dataInterlocks?: ProgramDataInterlock[]
	plugins?: {
		classString: string,
		imports?: {key: string, module: string}[],
		actions?: {key: string, func: string}[], //e.g. start/stop
		state?: {key: string, type: string}[] //e.g. {key: "speed", type: "number"}
		options?: {[key: string]: any};
		activeWhen?: string;
	}[]
}