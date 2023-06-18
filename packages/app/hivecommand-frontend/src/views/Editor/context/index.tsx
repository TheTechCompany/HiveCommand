// import { HMIType } from "@hive-command/command-surface";
import React from "react";
import { HMITag, HMITemplate, HMIType } from "../pages/controls/context";

export interface ICommandEditorContext {
	sidebarOpen?: boolean;
	refetch?: () => void;
	program?: {
		id?: string;
		components?: {
			id: string,
			name: string,
			main?: {
				path: string
			},
			files: {
				path: string,
				content: string
			}[]
		}[]
		dataScopes?: {id: string, name: string, plugin: {id: string, name: string}, configuration: any}[]
		templatePacks?: any[];
		templates?: HMITemplate[];
		tags?: HMITag[];
		types?: HMIType[]
		program?: any[];
		hmi?: any[];
		alarms?: any[];
	}
	plugins?: {
		dataScope?: {id: string, name: string, module: string, configuration: any}[]
	}
}

export const CommandEditorContext = React.createContext<ICommandEditorContext>({})

export const CommandEditorProvider = CommandEditorContext.Provider

export const useCommandEditor = () => React.useContext(CommandEditorContext)