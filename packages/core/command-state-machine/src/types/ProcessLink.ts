import { ProgramAction, ProgramActionType } from "./ProgramProcess";
import { TransitionCondition } from "./TransitionCondition";

export interface ProcessNode {
	id: string
	"sub-process"?: string
	extras?: {
		timer?: any;
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