import { ProgramAction } from "../../types";

export const handler = async (
	options: {actions: ProgramAction[]} = {actions: []},
	hub: {performOperation: (device: string, release : boolean, operation?: string) => void}
) => {
	
	let actions = options?.actions || [];

	let result = await Promise.all(actions.map(async (action: ProgramAction) => {
		return await hub.performOperation(action.device, action.release || false, action.operation)
	}))


	return result;

}