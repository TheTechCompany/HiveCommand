export interface PayloadResponse {
	payload?: {
		command: {
			id: string;
			type: string;
			configuration?: {
				key: string;
				value: string;
			}[];
			actions?: {
				key: string,
				target: string
			}[],
			next: {
				target: string,
				id: string,
				sourceHandle: string,
				targetHandle: string,
				conditions?: {
					input: string,
					inputKey: string,
					comparator: string,
					assertion: string,
				}[]
			}[]
		}[]
		layout?: AssignmentPayload[]
	}
}

export interface AssignmentPayload {
	actions?: {key: string, func: string}[]
	plugins?: {
		id: string, 
		name: string, 
		instance: any,
		tick: string,
		configuration: {
			key: string,
			value: string
		}[]
	}[]
	state?: {key: string, type: string, foreignKey: string}[]

	type: string;
	port: string
	bus: string
	id: string
	name: string
}