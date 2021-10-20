export interface PayloadResponse {
	payload?: {
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
}