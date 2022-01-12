import { gql } from "@apollo/client"

import { mutation, useMutation } from "../gqty"

export * from './placeholders'
export * from './conditions'
export * from './actions'

export const useCreateProgram = (organisation: string) => {

	console.log("USE CREATE", {organisation})
	const [ mutateFn ] = useMutation((mutation, args: {
		name: string
	}) => {
		const item = mutation.updateHiveOrganisations({
			where: {members: {id: organisation}},
			update: {
				commandPrograms: [{
					create: [{
						node: {
							name: args.name,
						}
					}]
				}]
			}
		})
			// const item = mutation.createCommandPrograms({
			// 	input: [{
					
			// 	}]
			// })
			return {
				item: {
					...item.hiveOrganisations?.[0]
				}
			}
	}, {
		refetchQueries: ['commandPrograms']
	})
	// gql`
	// 	mutation createProgram($name: String!){
	// 		createCommandProgram(name: $name) {
	// 			commandPrograms {
	// 				id
	// 			}
				
	// 		}
	// 	}
	// `)

	return (name: string) => {
		return mutateFn({args: {name}})
	}
}

export const useCreateProgramFlow = (programId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {name: string, parent?: string}) => {

		let query = {};
		if(args.parent){
			query = {
				where: {node: {id: args.parent}},
				update: {
					node: {
						children: [{
							create: [{
								node: {
									name: args.name
								}
							}]
						}]
					}
				}
			}
		}else{
			query = {
				create: [{node: {name: args.name}}]
			}
		}

		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				program: [query]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})

	return async (name: string, parent?: string) => {
		return await mutateFn({
			args: {
				name,
				parent
			}
		})
	}
}

export const useCreateProgramHMI = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {name: string, parent?: string}) => {
		
		let query = {};
		// if(args.parent){
		// 	query = {
		// 		where: {node: {id: args.parent}},
		// 		update: {
		// 			node: {
		// 				children: [{
		// 					create: [{
		// 						node: {
		// 							name: args.name
		// 						}
		// 					}]
		// 				}]
		// 			}
		// 		}
		// 	}
		// }else{
			query = {
				create: [{node: {name: args.name}}]
			}
		// }

		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				hmi: [query]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})
	return async (name: string, parent?: string) => {
		return await mutateFn({
			args: {
				name,
				parent
			}
		})
	}
}

export const updateProgram = () => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation updateProgram {

	// 	}
	// `)
}

export const useCreateProgramNode = (program: string, flow: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		type: string,
		x: number,
		y: number,
		subprocess?: string
	}) => {
		
		let query = {};
		if(args.type == "Connect" && args.subprocess){
			query = {
				type: args.type,
				x: args.x,
				y: args.y,
				subprocess: { connect: {where: {id: args.subprocess}}}
			}
		}else{
			query = {
				type: args.type,
				x: args.x,
				y: args.y
			}
		}

		const item = mutation.updateCommandPrograms({
			where: {id: program},
			update: {
				program: [{
					where: {node: {id: flow}},
					update: {
						node: {
							nodes: [{
								create: [{
									node: query
								}]
							}]
						}
					}
				}]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})

	return async (type: string, x: number, y: number, subprocess: string) => {
		return await mutateFn({
			args: {
				type,
				x,
				y,
				subprocess
			}
		})
	}

}

export const useUpdateProgramNode = (program: string, flow: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {node_id: string, x: number, y: number}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: program},
			update: {
				program: [{
					where: {node: {id:flow}},
					update: {
						node: {
							nodes: [{
								where: {node: {id: args.node_id}},
								update: {
									node: {
										x: args.x,
										y: args.y
									}
								}
							}]
						}
					}	
				}]
			}
		})

		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})
	return async (node_id: string, x: number, y: number) => {

		return await mutateFn({
			args: {
				node_id,
				x,
				y
			}
		})
	}
}

export const useDeleteProgramNodes = (program: string, flow: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {node_ids: string[]}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: program},
			update: {
				program: [{
					where: {node: {id: flow}},
					update: {
						node: {
							nodes: [{
								delete: [{where: {node: {id_IN: args.node_ids}}}]
							}]
						}
					}
				}]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})
	return async (nodes: string[]) => {

		return await mutateFn({
			args: {
				node_ids: nodes
			}
		})
	}
}

export const useConnectProgramNode = (program: string, flow: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		source: string, 
		sourceHandle: string,
		target: string,
		targetHandle: string,
		points: {x: number, y: number}[]
	}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: program},
			update: {
				program: [{
					where: {node: {id: flow}},
					update: {
						node: {
							nodes: [{
								where: {node: {id: args.source}},
								update: {
									node: {
										next: [{
											connect: [{
												where: {node: {id: args.target}},
												edge: {
													sourceHandle: args.sourceHandle,
													targetHandle: args.targetHandle,
													points: args.points
												}
											}]
										}]
									}
								}
							}]
						}
					}
				}]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})
	return  async (
		source: string, 
		sourceHandle: string, 
		target: string, 
		targetHandle: string,
		points: {x: number, y: number}[]
	) => {
		return await mutateFn({
			args: {
				source,
				sourceHandle,
				target,
				targetHandle,
				points
			}
		})
	}
}

export const useDisconnectProgramNode = (program: string, flow: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		source: string,
		sourceHandle: string,
		target: string, 
		targetHandle: string
	}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: program},
			update: {
				program: [{
					where: {node: {id: flow}},
					update: {
						node: {
							nodes: [{
								where: {node: {id: args.source}},
								update: {
									node: {
										next: [{
											disconnect: [{
												where: {
													edge: {
														sourceHandle: args.sourceHandle,
														targetHandle: args.targetHandle
													},
													node: {
														id: args.target
													}
												}
											}]
										}]
									}
								}
							}]
						}
					}
				}]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
			}
		}
	})
	return async (source: string, sourceHandle: string, target: string, targetHandle: string) => {
		return await mutateFn({
			args: {
				source,
				sourceHandle,
				target,
				targetHandle

			}
		})

	}
}

export const removeProgramEdge = () => {

}