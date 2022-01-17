import { getProgramSelector } from ".."
import { useMutation } from "../../gqty"

export const useRemoveNodeAction = (programId: string, flowId: string, parent?: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {nodeId: string, id: string}) => {

		let update = {
			node: {
				nodes: [{
					where: {node: { id: args.nodeId }},
					update: {
						node: {
							actions: [{
								delete: [{where: {node: {id: args.id}}}]
							}]
						}
					}
				}]
			}
		}

		let updateQuery = getProgramSelector(update, flowId, parent)

		const removeResult = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				program: [updateQuery]
			}
		})

		return {
			item: {
				...removeResult.commandPrograms?.[0]
			}
		}
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

export const useUpdateNodeConfiguration = (programId: string, flowId: string, parent?: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		id: string,
		actions?: {
			id?: string;
			device: {id: string} | string;
			request: {id: string} | string;
			release: boolean;
		}[]
		configuration?: {id?: string, key: string, value: string}[]
	}) => {

		let mutationElem = {}

		let actionMutation = {}

		if(args.actions){
			actionMutation = {
				actions: [{
					create: args.actions.filter((a) => !a.id).map((action) => ({
							node: {
								release: action.release,
								device: {connect: {where: {node: {id: typeof(action.device) == "object" ? action.device.id : action.device}}}},
								request: {connect: {where: {node: {id: typeof(action.request) == "object" ? action.request.id : action.request, device: {usedIn: {id: typeof(action.device) == "object" ? action.device.id : action.device}}}}}}
							}
						}))
					},
					...args.actions.filter((a) => a.id).map((action) => ({
						where: {node: {id: action.id}},
						update: {	
							node: {
									release: action.release,
									request: {
										connect: {
											where: {
												node: {
													id: typeof(action.request) == "object" ? action.request.id : action.request, 
													device: {
														usedIn: {
															id: typeof(action.device) == "object" ? action.device.id : action.device
														}
													}
												}
											}
										},
										disconnect: {
											where: {
												node: {
													id_NOT: typeof(action.request) == "object" ? action.request.id : action.request, 
												}
											}
										}
									},
									device: {
										connect: {
											where: {
												node: {
													id: typeof(action.device) == "object" ? action.device.id : action.device
												}
											}
										},
										disconnect: {
											where: {
												node: {
													id_NOT: typeof(action.device) == "object" ? action.device.id : action.device
												}
											}
										}
									}
								}
							}
						}))
					
				]
			}
		}

		if(args.configuration){
			mutationElem = {
				configuration: [{
					create: args.configuration.filter((a) => !a.id).map((conf) => ({
						node: {
							key: conf.key,
							value: conf.value
						}
					}))
				}, ...args.configuration.filter((a) => a.id).map((conf) => ({
					where: {
						node: {id: conf.id}
					},
					update: {
						node: {
							key: conf.key,
							value: conf.value
						}
					}
				}))]
			}
		}

		let update = {
			// node: {
				nodes: [{
					where: {node: {id: args.id}},
					update: {
						node: {
							...mutationElem,
							...actionMutation,
						}
					}
				}]
			// }
		}

		let where = parent ? { id: flowId, parent: {id: parent, programs: {id: programId}} } : { id: flowId, programs: {id: programId}}

		let updateQuery = getProgramSelector(update, flowId, parent)

		const addActions = mutation.updateCommandProgramFlows({
			where:  where, //{id: programId},
			update: update
	
		})
	
		return {
			item: {
				...addActions.commandProgramFlows?.[0]
			},
		}
	})

	return async (	
		id: string,
		actions?: {
			id?: string;
			device: {id: string} | string;
			request: {id: string} | string;
			release: boolean;
		}[],
		configuration?: {id?: string, key: string, value: string}[]
	) => {
		return await mutateFn({
			args: {
				id,
				actions,
				configuration
			}
		})
	}
}