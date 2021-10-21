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
	port: string
	bus: string
	id: string
	name: string
}