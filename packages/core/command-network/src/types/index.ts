export interface PayloadResponse {
	payload?: {
		command: {
			id: string;
			type: string;
			actions?: {
				device: string;
				request: string;
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