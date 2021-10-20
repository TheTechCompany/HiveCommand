import { ProcessLink, ProcessNode } from "./ProcessLink";

export type ProgramActionType = "action" | "timer"  | "sub-process" 

export interface ProgramAction {
	device: string;
	operation: string;
}


export interface ProgramProcess {
	id: string;
	name: string;
	nodes: {
		[key: string]: ProcessNode
	}
	links: {
		[key: string]: ProcessLink
	}
	sub_processes: ProgramProcess[],

}