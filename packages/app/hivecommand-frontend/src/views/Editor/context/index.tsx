import React from "react";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;
	refetch?: () => void;
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