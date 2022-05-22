import { getProgramSelector } from ".."
import { useMutation } from "../../gqty"

export const useRemoveNodeAction = (programId: string, flowId: string, parent?: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {nodeId: string, id: string}) => {

		// let update = {
		// 		nodes: [{
		// 			where: {node: { id: args.nodeId }},
		// 			update: {
		// 				node: {
		// 					actions: [{
		// 						delete: [{where: {node: {id: args.id}}}]
		// 					}]
		// 				}
		// 			}
		// 		}]
			
		// }

		// let updateQuery = getProgramSelector(update, flowId, parent)

		// const removeResult = mutation.updateCommandProgramFlows({
		// 	where: {id: flowId}, //, programs: {id: programId}
		// 	update: {
		// 		...update,
		// 	}
		// })

		const removeResult = mutation.deleteCommandProgramFlowNodeAction({
			flow: flowId,
			program: programId,
			node: args.nodeId,
			id: args.id,
		})

		return {
			item: {
				success: removeResult
			}
		}

		// return {
		// 	item: {
		// 		...removeResult.commandProgramFlows?.[0]
		// 	}
		// }
	})

	return async (nodeId: string, actionId: string) => {
		return await mutateFn({
			args: {
				nodeId,
				id: actionId
			}
		})
	}
}

export const useCreateNodeAction = (programId: string, flowId: string, parent?: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		nodeId: string, 
		action?: {
			id?: string;
			device: string;
			request: string;
			release: boolean;
		}
	}) => {

		const newItem = mutation.createCommandProgramFlowNodeAction({
			flow: flowId,
			program: programId,
			node: args.nodeId,
			input: {
				device: args.action?.device,
				request: args.action?.request
			}
		})

		return {
			item: {
				...newItem
			}
		}

		// return {
		// 	item: {
		// 		...removeResult.commandProgramFlows?.[0]
		// 	}
		// }
	})

	return async (
		nodeId: string, 
		actions?: {
			id?: string;
			device: string;
			request: string;
			release: boolean;
		}
	) => {
		return await mutateFn({
			args: {
				nodeId,
				action: actions
			}
		})
	}

}

export const useUpdateNodeAction = (programId: string, flowId: string, parent?: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		nodeId: string, 
		action?: {
			id?: string;
			device: string;
			request: string;
			release: boolean;
		}
	}) => {

		
		const newItem = mutation.updateCommandProgramFlowNodeAction({
			id: args.action?.id,
			flow: flowId,
			program: programId,
			node: args.nodeId,
			input: {
				device: args.action?.device,
				request: args.action?.request
			}
		})

		return {
			item: {
				...newItem
			}
		}

		// return {
		// 	item: {
		// 		...removeResult.commandProgramFlows?.[0]
		// 	}
		// }
	})

	return async (
		nodeId: string, 
		actions?: {
			id?: string;
			device: string;
			request: string;
			release: boolean;
		}
	) => {
		return await mutateFn({
			args: {
				nodeId,
				action: actions
			}
		})
	}
}

export const useUpdateNodeTimer = (programId: string, flowId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		id: string,
		value: string,
		unit: string
	}) => {
		const item = mutation.updateCommandProgramFlowNode({
			flow: flowId,
			program: programId,
			id: args.id,
			input: {
				timer: args.value,
				timerUnit: args.unit
			}
		})
		return {
			item: {
				...item
			}
		}
	})

	return (id: string, value: string, unit: string) => {
		return mutateFn({
			args: {
				id,
				value,
				unit
			}
		})
	}
}

// export const useUpdateNodeConfiguration = (programId: string, flowId: string, parent?: string) => {

// 	const [ mutateFn ] = useMutation((mutation, args: {
// 		id: string,
// 		actions?: {
// 			id?: string;
// 			device: {id: string} | string;
// 			request: {id: string} | string;
// 			release: boolean;
// 		}[]
// 		configuration?: {id?: string, key: string, value: string}[]
// 	}) => {

// 		// let mutationElem = {}

// 		// let actionMutation = {}

// 		// if(args.actions){
// 		// 	actionMutation = {
// 		// 		actions: [{
// 		// 			create: args.actions.filter((a) => !a.id).map((action) => ({
// 		// 					node: {
// 		// 						release: action.release,
// 		// 						device: {connect: {where: {node: {id: typeof(action.device) == "object" ? action.device.id : action.device}}}},
// 		// 						request: {connect: {where: {node: {id: typeof(action.request) == "object" ? action.request.id : action.request, device: {usedIn: {id: typeof(action.device) == "object" ? action.device.id : action.device}}}}}}
// 		// 					}
// 		// 				}))
// 		// 			},
// 		// 			...args.actions.filter((a) => a.id).map((action) => ({
// 		// 				where: {node: {id: action.id}},
// 		// 				update: {	
// 		// 					node: {
// 		// 							release: action.release,
// 		// 							request: {
// 		// 								connect: {
// 		// 									where: {
// 		// 										node: {
// 		// 											id: typeof(action.request) == "object" ? action.request.id : action.request, 
// 		// 											device: {
// 		// 												usedIn: {
// 		// 													id: typeof(action.device) == "object" ? action.device.id : action.device
// 		// 												}
// 		// 											}
// 		// 										}
// 		// 									}
// 		// 								},
// 		// 								disconnect: {
// 		// 									where: {
// 		// 										node: {
// 		// 											id_NOT: typeof(action.request) == "object" ? action.request.id : action.request, 
// 		// 										}
// 		// 									}
// 		// 								}
// 		// 							},
// 		// 							device: {
// 		// 								connect: {
// 		// 									where: {
// 		// 										node: {
// 		// 											id: typeof(action.device) == "object" ? action.device.id : action.device
// 		// 										}
// 		// 									}
// 		// 								},
// 		// 								disconnect: {
// 		// 									where: {
// 		// 										node: {
// 		// 											id_NOT: typeof(action.device) == "object" ? action.device.id : action.device
// 		// 										}
// 		// 									}
// 		// 								}
// 		// 							}
// 		// 						}
// 		// 					}
// 		// 				}))
					
// 		// 		]
// 		// 	}
// 		// }

// 		// if(args.configuration){
// 		// 	mutationElem = {
// 		// 		configuration: [{
// 		// 			create: args.configuration.filter((a) => !a.id).map((conf) => ({
// 		// 				node: {
// 		// 					key: conf.key,
// 		// 					value: conf.value
// 		// 				}
// 		// 			}))
// 		// 		}, ...args.configuration.filter((a) => a.id).map((conf) => ({
// 		// 			where: {
// 		// 				node: {id: conf.id}
// 		// 			},
// 		// 			update: {
// 		// 				node: {
// 		// 					key: conf.key,
// 		// 					value: conf.value
// 		// 				}
// 		// 			}
// 		// 		}))]
// 		// 	}
// 		// }

// 		// let update = {
// 		// 	// node: {
// 		// 		nodes: [{
// 		// 			where: {node: {id: args.id}},
// 		// 			update: {
// 		// 				node: {
// 		// 					...mutationElem,
// 		// 					...actionMutation,
// 		// 				}
// 		// 			}
// 		// 		}]
// 		// 	// }
// 		// }

// 		// let where = parent ? { id: flowId, parent: {id: parent, programs: {id: programId}} } : { id: flowId, programs: {id: programId}}

// 		// // let updateQuery = getProgramSelector(update, flowId, parent)

// 		// const addActions = mutation.updateCommandProgramFlows({
// 		// 	where:  where, //{id: programId},
// 		// 	update: update
	
// 		// })
	
// 		// return {
// 		// 	item: {
// 		// 		...addActions.commandProgramFlows?.[0]
// 		// 	},
// 		// }
// 	})

// 	return async (	
// 		id: string,
// 		actions?: {
// 			id?: string;
// 			device: {id: string} | string;
// 			request: {id: string} | string;
// 			release: boolean;
// 		}[],
// 		configuration?: {id?: string, key: string, value: string}[]
// 	) => {
// 		return await mutateFn({
// 			args: {
// 				id,
// 				actions,
// 				configuration
// 			}
// 		})
// 	}
// }