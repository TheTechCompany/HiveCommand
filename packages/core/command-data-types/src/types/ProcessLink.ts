import { ProgramAction, ProgramActionType } from "./ProgramProcess";
import { TransitionCondition } from ".";

export interface ProcessNode {
	id: string
	extras?: {
		timer?: any;
		"sub-process"?: string;
		blockType?: ProgramActionType;
		actions?: ProgramAction[];
	}
}

export interface ProcessLink {
	source: string;
	target: string;

	extras?: {
		conditions?: TransitionCondition[]
	}
}