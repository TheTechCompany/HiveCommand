import React from "react";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;

	program?: {
		id?: string;
		program?: any[];
		hmi?: any[]
	}
}

export const CommandEditorContext = React.createContext<ICommandEditorContext>({})

export const CommandEditorProvider = CommandEditorContext.Provider

export const useCommandEditor = () => React.useContext(CommandEditorContext)