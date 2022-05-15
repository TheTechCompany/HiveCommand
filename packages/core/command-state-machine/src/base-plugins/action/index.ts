import { nanoid } from "nanoid";
import { ProgramAction } from "@hive-command/data-types";

export const handler = async (
	options?: {actions: ProgramAction[]},
	hub?: {performOperation: (device: string, release : boolean, operation?: string) => Promise<any>}
) => {
	
	let actions = options?.actions || [];

	let promise =  Promise.all(actions.map(async (action: ProgramAction) => {
		const id = nanoid()
		const res = await hub?.performOperation(action.device.name, action.release || false, action.request.key)

	}))
	
	return {
		promise,
		cancel: () => { console.warn(`Actions are not cancellable`) }
	};

}