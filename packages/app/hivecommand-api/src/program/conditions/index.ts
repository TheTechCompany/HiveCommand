import { nanoid } from "nanoid";
import { getProgramSelector } from "..";
import { CommandAssertionInput, useMutation } from "../../gqty";


export const useCreatePathCondition = (programId: string, flowId: string, parent?: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		path: string,
		inputDevice: string,
		inputDeviceKey: string,
		comparator: string,
		assertion: CommandAssertionInput
	}) => {
		const item = mutation.createCommandProgramFlowEdgeCondition({
			edge: args.path,
			program: programId,
			flow: flowId,
			input: {
				inputDevice: args.inputDevice,
				inputDeviceKey: args.inputDeviceKey,
				comparator: args.comparator,
				assertion: args.assertion
			}
		})
		return {
			item: {
				...item,
			}
		}
	})

	return async (id: string, item: {inputDevice: string, inputDeviceKey: string, comparator: string, assertion: CommandAssertionInput}) => {
		return await mutateFn({
			args: {
				path: id,
				inputDevice: item.inputDevice,
				inputDeviceKey: item.inputDeviceKey,
				comparator: item.comparator,
				assertion: item.assertion
			}
		})
	}
}	

export const useUpdatePathCondition = (programId: string, flowId: string, parent?: string) => {

	console.log({programId}, {flowId})
	const [ mutateFn ] = useMutation((mutation, args: {
		sourceNode: string,
		id: string,
		condition: {
			id: string,
			inputDevice: string,
			inputDeviceKey: string,
			comparator: string,
			assertion: CommandAssertionInput
		}
	}) => {

		const item = mutation.updateCommandProgramFlowEdgeCondition({
			flow: flowId,
			program: programId,
			id: args.condition.id,
			input: {
				inputDevice: args.condition.inputDevice,
				inputDeviceKey: args.condition.inputDeviceKey,
				comparator: args.condition.comparator,
				assertion: args.condition.assertion
			}
		})

		// let newIds = args.conditions.filter((a) => !a.id).map((x) => nanoid()) || []
		// let totalIds = args.conditions.filter((a) => a.id).map((x) => x.id || '').concat(newIds);

		// console.log({totalIds})
		
		// let where = parent ? {id: flowId, parent: {id: parent, programs: {id: programId}}} : {id: flowId, programs: {id: programId}}

		// const item = mutation.updateCommandProgramFlows({
		// 	where: where, //.{id: flowId, programs: {id: programId}},
		// 	update: {
		// 		nodes: [{
		// 			where: {node: {id: args.sourceNode}},
		// 			update: {
		// 				node: {
		// 					next: [{
		// 						where: {edge: {id: args.id}},
		// 						update: {
		// 							edge: {
		// 								conditions: totalIds
		// 							}
		// 						}
		// 					}]
		// 				}
		// 			}
		// 		}],
		// 		conditions: [{
		// 				create: args.conditions.filter((a) => !a.id).map((condition, ix) => ({
						
		// 						node: {
		// 							id: newIds[ix],
		// 							inputDevice: {
										
		// 								connect: {
		// 									where: {
		// 										node: {
		// 											 id: (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id : condition.inputDevice 
		// 										}
		// 									},
	
		// 								}
		// 							},
		// 							inputDeviceKey: {
		// 								connect: {
		// 									where: {
		// 										node: {
		// 											id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey
		// 										}
		// 									}
		// 								}
		// 							},
		// 							comparator: condition.comparator,
		// 							assertion: condition.assertion
		// 						}
							
		// 				})),		 
					
		// 		}]
		// 	}
		// })

		// // const res = mutation.updateCommandPrograms({
		// // 	where: {id: programId},
		// // 	update: {
		// // 		program: [{
		// // 			where: {node: {id: flowId}},
		// // 			update: {
		// // 				node: {
		// // 					nodes: [{
		// // 						where: {
		// // 							node: {
		// // 								id: args.sourceNode,
		// // 							}
		// // 						},
		// // 						update: {
		// // 							node: {
		// // 								next: [{
		// // 									where: {
		// // 										edge: {
		// // 											id: args.id
		// // 										}
		// // 									},
		// // 									update: {
		// // 										edge: {
		// // 											conditions: totalIds
		// // 										}
		// // 									}
		// // 								}]
		// // 							}
		// // 						}
		// // 					}],
		// // 					conditions: [{
		// // 						create: args.conditions.filter((a) => !a.id).map((condition, ix) => ({
								
		// // 								node: {
		// // 									id: newIds[ix],
		// // 									inputDevice: {
												
		// // 										connect: {
		// // 											where: {
		// // 												node: {
		// // 													 id: (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id : condition.inputDevice 
		// // 												}
		// // 											},
			
		// // 										}
		// // 									},
		// // 									inputDeviceKey: {
		// // 										connect: {
		// // 											where: {
		// // 												node: {
		// // 													id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey
		// // 												}
		// // 											}
		// // 										}
		// // 									},
		// // 									comparator: condition.comparator,
		// // 									assertion: condition.assertion
		// // 								}
									
		// // 						})),		 
		// // 					},
		// // 						...args.conditions.filter((a) => a.id).map((condition) => ({
		// // 							where: {
		// // 								node: {id: condition.id}
		// // 							},
		// // 							update: {
		// // 								node: {
		// // 									inputDevice: {connect: {where: {node: {id:  (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id :condition.inputDevice}}}},
		// // 									inputDeviceKey: {connect: {where: {node: {id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey}}}},
		// // 									comparator: condition.comparator,
		// // 									assertion: condition.assertion
		// // 								}
		// // 							}
		// // 						}))
							
		// // 					]
		// // 				}
		// // 			}
		// // 		}],
				
		// // 	}
		// // })

		// // mutation.updateCommandProgramFlows({
		// // 	where: {n}
		// // })
		// return {
		// 	item: {
		// 		...item.commandProgramFlows?.[0]
		// 	}
		// }
		return {
			item: {
				...item
			}
		}
	})

	return async (
		sourceNode: string,
		id: string,
		condition: {
			id: string;
			inputDevice: string,
			inputDeviceKey: string ,
			comparator: string,
			assertion: CommandAssertionInput
		}
	) => {
		return await mutateFn({
			args: {
				sourceNode,
				id,
				condition
			}
		})
	}

}


export const useRemovePathCondition = (programId: string, flowId: string, parent?: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {id: string}) => {

		const item  = mutation.deleteCommandProgramFlowEdgeCondition({
			flow: flowId,
			program: programId,
			id: args.id
		})
		// let update = {

		// 	node: {
		// 		conditions: [{
		// 			delete: [{
		// 				where: {
		// 					node: {
		// 						id: args.id
		// 					}
		// 				}
		// 			}]
		// 		}]
		// 	}
		
		// }
		// let updateQuery = getProgramSelector(update, flowId, parent)

		// const removeResult = mutation.updateCommandPrograms({
		// 	where: {id: programId},
		// 	update: {
		// 		program: [updateQuery]
		// 	}
		// })
		// return {
		// 	item: {
		// 		...removeResult?.commandPrograms?.[0]
		// 	}
		// }
		return {
			item: {
				success: item
			}
		}
	})
	return async (id: string) => {
		return await mutateFn({
			args: {
				id
			}
		})
	}	
}
