import React from "react";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;
	refetch?: () => void;
	deviceTypes?: {
		id: string;
		tagPrefix?: string;
		name: string;
	}[];
	program?: {
		id?: string;
		templatePacks?: any[];
		program?: any[];
		hmi?: any[]
	}
}

export const CommandEditorContext = React.createContext<ICommandEditorContext>({})

export const CommandEditorProvider = CommandEditorContext.Provider

export const useCommandEditor = () => React.useContext(CommandEditorContext)