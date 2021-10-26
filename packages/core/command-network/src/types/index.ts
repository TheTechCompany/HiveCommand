export interface PayloadResponse {
	payload?: {
		command: {
			id: string;
			type: string;
			configuration?: {
				key: string;
				value: string;
			}[];
			next: {
				target: string,
				id: string,
				sourceHandle: string,
				targetHandle: string
			}[]
		}[]
		layout?: AssignmentPayload[]
	}
}

export interface AssignmentPayload {
	actions?: {key: string, func: string}[]
	state?: {key: string, type: string}[]
	type: string;
	port: string
	bus: string
	id: string
	name: string
}