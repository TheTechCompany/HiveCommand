import { ProcessLink, ProcessNode } from "./ProcessLink";
import { CommandProcessNode, CommandProcessEdge } from ".";

export type ProgramActionType = "action" | "timer"  | "sub-process" | "pid"

export interface ProgramAction {
	device: string;
	release?: boolean;
	operation?: string;
}


export interface ProgramProcess {
	id: string;
	name: string;
	nodes: CommandProcessNode[]
	edges?: CommandProcessEdge[]
	sub_processes?: ProgramProcess[],
}