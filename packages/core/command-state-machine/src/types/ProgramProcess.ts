import { ProcessLink, ProcessNode } from "./ProcessLink";

export type ProgramActionType = "action" | "timer"  | "sub-process" | "pid"

export interface ProgramAction {
	device: string;
	release?: boolean;
	operation?: string;
}


export interface ProgramProcess {
	id: string;
	name: string;
	nodes: {
		[key: string]: ProcessNode
	}
	links?: {
		[key: string]: ProcessLink
	}
	sub_processes?: ProgramProcess[],

}