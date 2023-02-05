// import { HMIType } from "@hive-command/command-surface";
import React from "react";
import { HMITemplate, HMIType } from "../pages/controls/context";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;
	refetch?: () => void;
	program?: {
		id?: string;
		templatePacks?: any[];
		templates?: HMITemplate[];
		types?: HMIType[]
		program?: any[];
		hmi?: any[]
	}
}

export const CommandEditorContext = React.createContext<ICommandEditorContext>({})

export const CommandEditorProvider = CommandEditorContext.Provider

export const useCommandEditor = () => React.useContext(CommandEditorContext)