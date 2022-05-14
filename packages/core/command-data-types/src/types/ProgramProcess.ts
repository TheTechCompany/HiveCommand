import { CommandProcessNode, CommandProcessEdge } from ".";

export type ProgramActionType = "action" | "timer"  | "sub-process" | "pid"

export interface ProgramAction {
	id: string;
	release: boolean;
	request: {
		key: string
	},
	device: {
		id: string
		name: string;
	}
}


export interface ProgramProcess {
	id: string;
	name: string;
	nodes: CommandProcessNode[]
	edges?: CommandProcessEdge[]
	sub_processes?: ProgramProcess[],
}