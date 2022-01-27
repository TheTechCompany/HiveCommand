import { nanoid } from "nanoid";
import { ProgramAction } from "../../types";

export const handler = async (
	options?: {actions: ProgramAction[]},
	hub?: {performOperation: (device: string, release : boolean, operation?: string) => Promise<any>}
) => {
	
	// console.log("ACTIONS", options?.actions)

	let actions = options?.actions || [];

	console.log("Action in", {hub});

	let result = await Promise.all(actions.map(async (action: ProgramAction) => {
		const id = nanoid()
		const res = await hub?.performOperation(action.device, action.release || false, action.operation)

	}))


	// console.log("Action out")

	return result;

}