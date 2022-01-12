import { nanoid } from "nanoid";
import { useMutation } from "../../gqty";

export const useUpdatePathConditions = (programId: string, flowId: string) => {

	console.log({programId}, {flowId})
	const [ mutateFn ] = useMutation((mutation, args: {
		sourceNode: string,
		id: string,
		conditions: {
			id?: string;
			inputDevice: string | {id?: string},
			inputDeviceKey: string | {id?: string},
			comparator: string,
			assertion: string
		}[]
	}) => {

		let newIds = args.conditions.filter((a) => !a.id).map((x) => nanoid()) || []
		let totalIds = args.conditions.filter((a) => a.id).map((x) => x.id || '').concat(newIds);

		console.log({totalIds})

		const item = mutation.updateCommandProgramFlows({
			where: {id: flowId, programs: {id: programId}},
			update: {
				nodes: [{
					where: {node: {id: args.sourceNode}},
					update: {
						node: {
							next: [{
								where: {edge: {id: args.id}},
								update: {
									edge: {
										conditions: totalIds
									}
								}
							}]
						}
					}
				}],
				conditions: [{
						create: args.conditions.filter((a) => !a.id).map((condition, ix) => ({
						
								node: {
									id: newIds[ix],
									inputDevice: {
										
										connect: {
											where: {
												node: {
													 id: (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id : condition.inputDevice 
												}
											},
	
										}
									},
									inputDeviceKey: {
										connect: {
											where: {
												node: {
													id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey
												}
											}
										}
									},
									comparator: condition.comparator,
									assertion: condition.assertion
								}
							
						})),		 
					
				}]
			}
		})

		// const res = mutation.updateCommandPrograms({
		// 	where: {id: programId},
		// 	update: {
		// 		program: [{
		// 			where: {node: {id: flowId}},
		// 			update: {
		// 				node: {
		// 					nodes: [{
		// 						where: {
		// 							node: {
		// 								id: args.sourceNode,
		// 							}
		// 						},
		// 						update: {
		// 							node: {
		// 								next: [{
		// 									where: {
		// 										edge: {
		// 											id: args.id
		// 										}
		// 									},
		// 									update: {
		// 										edge: {
		// 											conditions: totalIds
		// 										}
		// 									}
		// 								}]
		// 							}
		// 						}
		// 					}],
		// 					conditions: [{
		// 						create: args.conditions.filter((a) => !a.id).map((condition, ix) => ({
								
		// 								node: {
		// 									id: newIds[ix],
		// 									inputDevice: {
												
		// 										connect: {
		// 											where: {
		// 												node: {
		// 													 id: (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id : condition.inputDevice 
		// 												}
		// 											},
			
		// 										}
		// 									},
		// 									inputDeviceKey: {
		// 										connect: {
		// 											where: {
		// 												node: {
		// 													id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey
		// 												}
		// 											}
		// 										}
		// 									},
		// 									comparator: condition.comparator,
		// 									assertion: condition.assertion
		// 								}
									
		// 						})),		 
		// 					},
		// 						...args.conditions.filter((a) => a.id).map((condition) => ({
		// 							where: {
		// 								node: {id: condition.id}
		// 							},
		// 							update: {
		// 								node: {
		// 									inputDevice: {connect: {where: {node: {id:  (typeof(condition.inputDevice) == "object") ? condition.inputDevice.id :condition.inputDevice}}}},
		// 									inputDeviceKey: {connect: {where: {node: {id: (typeof(condition.inputDeviceKey) == "object") ? condition.inputDeviceKey.id : condition.inputDeviceKey}}}},
		// 									comparator: condition.comparator,
		// 									assertion: condition.assertion
		// 								}
		// 							}
		// 						}))
							
		// 					]
		// 				}
		// 			}
		// 		}],
				
		// 	}
		// })

		// mutation.updateCommandProgramFlows({
		// 	where: {n}
		// })
		return {
			item: {
				...item.commandProgramFlows?.[0]
			}
		}
	})

	return async (
		sourceNode: string,
		id: string,
		conditions: {
			id?: string;
			inputDevice: string | {id?: string},
			inputDeviceKey: string | {id?: string},
			comparator: string,
			assertion: string
		}[]
	) => {
		return await mutateFn({
			args: {
				sourceNode,
				id,
				conditions
			}
		})
	}

}


export const useRemovePathConditions = (programId: string, flowId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {id: string}) => {

		const removeResult = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				program: [{
					where: {node: {id: flowId}},
					update: {
						node: {
							conditions: [{
								delete: [{
									where: {
										node: {
											id: args.id
										}
									}
								}]
							}]
						}
					}
				}]
			}
		})
		return {
			item: {
				...removeResult?.commandPrograms?.[0]
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
