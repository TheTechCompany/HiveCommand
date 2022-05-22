import { CommandProcessNode, CommandProcessEdge } from ".";

export type ProgramActionType = "action" | "timer"  | "sub-process" | "pid"

export interface ProgramAction {
	id: string;
	release: boolean;
	request: string;
	device:string;
}

export interface ProgramTimer {
	unit: string;
	value: string;
}


export interface ProgramProcess {
	id: string;
	name: string;
	nodes: CommandProcessNode[]
	edges?: CommandProcessEdge[]
	sub_processes?: ProgramProcess[],
}