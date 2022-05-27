import { EdgeConditionAssertion } from "./Condition";
import { ProgramAction, ProgramTimer } from "./ProgramProcess";

export type GetSetpoint = (id: string) =>  any;
export type GetVariable = (key: string) => any;

export interface ConditionValueBank {
    getSetpoint?: GetSetpoint;
    getVariable?: GetVariable;
}

export interface CommandProcess {
	id?: string;
	name?: string;
	nodes?: CommandProcessNode[];
	edges?: CommandProcessEdge[];

	sub_processes?: CommandProcess[];
}

export interface CommandProcessEdge {
	id: string;
	source: string;
	target: string;
	options?: {
		conditions?: {
			inputDevice: string;
			inputDeviceKey: string;
			comparator: string;
			assertion: EdgeConditionAssertion
		}[]
	};
}

export interface CommandProcessNode {
	id: string;
	type: string;
	options?: {
		blockType: string;
		["sub-process"]?: string;
		timer?: ProgramTimer;
		actions?: ProgramAction[]
	};
}

export interface CommandHub {
	performOperation: any;
	actions?: CommandAction[];
	getState: (key: string) => {[key: string]: any} | any;
	setState: (key: string, value: {[key: string]: any} | any) => void;
	valueBank: ConditionValueBank;
}

export type CommandActionEntry = (options: any, hub: CommandHub, node: CommandProcess) => Promise<{promise: Promise<any>, cancel: () => void}>;

export interface CommandAction {
	id: string;
	onEnter?: CommandActionEntry
	onExit?: (
		options: any, 
		hub: CommandHub, 
		node: CommandProcess
	) => Promise<any>
}
