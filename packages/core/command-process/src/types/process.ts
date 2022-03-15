export interface CommandProcess {
	id?: string;
	name?: string;
	nodes?: CommandProcessNode[];
	edges?: CommandProcessEdge[];

	sub_processes?: CommandProcess[];
}

export interface CommandProcessEdge {
	source: string;
	target: string;
	options?: any;
}

export interface CommandProcessNode {
	id: string;
	type: string;
	options?: any;
}

export interface CommandHub {
	performOperation: any;
	actions?: CommandAction[];
	getState: (key: string) => {[key: string]: any} | any;
	setState: (key: string, value: {[key: string]: any} | any) => void;
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

export interface ProgramAction {
	device: string;
	release?: boolean;
	operation?: string;
}
