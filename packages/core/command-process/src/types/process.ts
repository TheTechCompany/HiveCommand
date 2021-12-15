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

export interface CommandAction {
	id: string;
	onEnter?: (options: any, hub: {performOperation: any, actions?: CommandAction[], getState: any}) => any
	onExit?: (options: any, hub: {performOperation: any, actions?: CommandAction[], getState: any}) => any
}

export interface ProgramAction {
	device: string;
	release?: boolean;
	operation?: string;
}
