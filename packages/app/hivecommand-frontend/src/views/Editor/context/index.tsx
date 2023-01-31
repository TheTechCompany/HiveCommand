import React from "react";
import { HMITemplate } from "../pages/controls/context";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;
	refetch?: () => void;
	deviceTypes?: {
		id: string;
		state: {
			key: string,
			type: string
		}[]
		tagPrefix?: string;
		name: string;
	}[];
	program?: {
		id?: string;
		templatePacks?: any[];
		templates?: HMITemplate[];
		program?: any[];
		hmi?: any[]
	}
}

export const CommandEditorContext = React.createContext<ICommandEditorContext>({})

export const CommandEditorProvider = CommandEditorContext.Provider

export const useCommandEditor = () => React.useContext(CommandEditorContext)