export interface ProgramDevice {
	name: string;
	requiresMutex?: boolean;
	interlock?: {
		state: {[key: string]: any};
		locks: {device: string, deviceKey: string, comparator: string, value: any, fallback: string}[]
		// fallback: {operation: string, release?: boolean }[]
		// fallforward: {operation: string }[]
	}
}