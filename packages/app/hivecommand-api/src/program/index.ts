import { gql } from "@apollo/client"

import { useMutation } from "../gqty"
export * from './placeholders'

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

export const createProgramFlow = async (programId: string, name: string, parent?: string) => {
	
	let query = '';
	if(parent){
		query = `
		program: [{
			where: {node: {id: $parent}},
			update: {
				node: {
					children: [{
						create: [{
							node: {
								name: $name
							}
						}]
					}]
				}
			}
		}]
		`
	}else{
		query = `
		program: [{
			create: [{node: {name: $name}}]
		}]
		`
	}


	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation addProgramFlow($programId: ID!, name: String!, parent: ID) {
	// 		updateCommandPrograms(
	// 			where: {id: $programId},
	// 			update: {
	// 				${query}
	// 			}
	// 		){
	// 			id
	// 		}
	// 	}
	// `)

	// // update = {
	// // 	//         program: [{
	// // 	//             where: {node: {id: args.parent}},
	// // 	//             update: {
	// // 	//                 node: {
	// // 	//                     children: [{
	// // 	//                         create: [{node: {
	// // 	//                             name: args.name || "Default"
	// // 	//                         }}]
	// // 	//                     }]
	// // 	//                 }
	// // 	//             }
	// // 	//         }]
	// // 	//        }
	// return await mutateFn({
	// 	variables: {
	// 		programId,
	// 		name,
	// 		parent
	// 	}
	// })
}

export const createProgramHMI = async (programId: string, name: string, parent?: string) => {
	let query = ''
	if(parent){
		query = `
		hmi: [{
			where: {node: {id: $parent}},
			update: {
				node: {
					children: [{
						create: [{
							node: {
								name: $name
							}
						}]
					}]
				}
			}
		}]
		`
	}else{
		query = `
		hmi: [{
			create: [{node: {name: $name}}]
		}]
		`
	}
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation addProgramHMI($programId: ID!, name: String!, parent: ID) {
	// 		updateCommandPrograms(
	// 			where: {id: $programId},
	// 			update: {
	// 				${query}
	// 			}
	// 		){
	// 			id
	// 		}
	// 	}
	// `)

	// return await mutateFn({variables: {
	// 	programId,
	// 	name,
	// 	parent
	// }})
}

export const updateProgram = () => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation updateProgram {

	// 	}
	// `)
}

export const createProgramNode = async (program: string, type: string, x: number, y: number, subprocess: string) => {
	let query = ``;

	if(type == "Connect" && subprocess){
		query = `
			{
				type: $type,
				x: $x,
				y: $y,
				subprocess: {connect: {where: {id: $subprocess}}}
			}
		`
	}else{
		query = `
			{
				type: $type,
				x: $x,
				y: $y
			}
		`
	}
	// let node : any = {
	// 	type: type,
	// 	x: x,
	// 	y: y,
	// }

	// if(type == "Connect" && subprocess){
	// 	node.subprocess = {
	// 		connect: {where: {node: {id: subprocess}}}
	// 	}
	// }

	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation createProgramNode($program: ID!) {
	// 		updateCommandProgramFlows({
	// 			where: {id: $program},
	// 			update: {
	// 				nodes: [{
	// 					create: [${query}]
	// 				}]
	// 			}
	// 		}){
	// 			id
	// 			name
	// 			nodes {
	// 				id
	// 			}
	// 		}
	// 	}
	// `)

	// return await mutateFn({
	// 	variables: {
	// 		program: program,
	// 		type,
	// 		x,
	// 		y,
	// 		subprocess
	// 	}
	// })

}

export const updateProgramNode = async (program: string, node_id: string, x: number, y: number) => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation updateProgramNode($program: ID!, $node_id: ID!, $x: Float!, $y: Float!) {
	// 		updateCommandProgramFlows({
	// 			where: {id: $program},
	// 			update: {
	// 				nodes: [{
	// 					where: {id: $node_id},
	// 					update: {
	// 						x: $x,
	// 						y: $y
	// 					}
	// 				}]
	// 			}
	// 		}){
	// 			id
	// 			name
	// 			nodes {
	// 				id
	// 			}
	// 		}
	// 	}
	// `)

	// return await mutateFn({
	// 	variables: {
	// 		program: program,
	// 		node_id,
	// 		x,
	// 		y
	// 	}
	// })
}

export const deleteProgramNodes = async (program: string, nodes: string[]) => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation deleteProgramNode($program: ID!, $node_id: [ID]!) {
	// 		updateCommandProgramFlows({
	// 			where: {id: $program},
	// 			update: {
	// 				nodes: [{
	// 					delete: [{id_IN: $node_id}]
	// 				}]
	// 			}
	// 		}){
	// 			id
	// 			name
	// 			nodes {
	// 				id
	// 			}
	// 		}
	// 	}
	// `)

	// return await mutateFn({
	// 	variables: {
	// 		program: program,
	// 		node_id: nodes
	// 	}
	// })
}

export const connectProgramNode = async (
	program: string, 
	source: string, 
	sourceHandle: string, 
	target: string, 
	targetHandle: string,
	points: {x: number, y: number}[]
) => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation connectProgramNode($program: ID!, $source: ID!, $sourceHandle: String!, $target: ID!, $targetHandle: String!, $points: [CartesianPointInput]!) {
	// 		updateCommandProgramFlows({
	// 			where: {id: $program},
	// 			update: {
	// 				nodes: [{
	// 					where: {id: $source},
	// 					update: {
	// 						next: [{
	// 							connect: [{
	// 								where: {
	// 									node: {id: $target}
	// 								},
	// 								edge: {
	// 									sourceHandle: $sourceHandle,
	// 									targetHandle: $targetHandle,
	// 									points: $points
	// 								}
	// 							}]
	// 						}]
	// 					}
	// 				}]
	// 			}
	// 		}){
	// 			id
	// 			name
	// 			nodes {
	// 				id
	// 			}
	// 		}

	// 	}
	// `)

	// return await mutateFn({
	// 	variables: {
	// 		program: program,
	// 		source,
	// 		sourceHandle,
	// 		target,
	// 		targetHandle,
	// 		points
	// 	}
	// })
}

export const disconnectProgramNode = async (program: string, source: string, sourceHandle: string, target: string, targetHandle: string) => {
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation disconnectProgramNode($program: ID!, $source: ID!, $sourceHandle: String!, $target: ID!, $targetHandle: String!) {
	// 		updateCommandProgramFlows({
	// 			where: {id: $program},
	// 			update: {
	// 				nodes: [{
	// 					where: {id: $source},
	// 					update: {
	// 						next: [{
	// 							disconnect: [{
	// 								where: {
	// 									edge: {
	// 										sourceHandle: $sourceHandle,
	// 										targetHandle: $targetHandle
	// 									},
	// 									node: {
	// 										id: $target
	// 									}
	// 								}
	// 							}]
	// 						}]
	// 					}
	// 				}]
	// 			}
	// 		}){
	// 			id
	// 			name
	// 			nodes {
	// 				id
	// 			}
	// 		}
	// 	}
	// `)

	// return await mutateFn({
	// 	variables: {
	// 		program: program,
	// 		source,
	// 		sourceHandle,
	// 		target,
	// 		targetHandle
	// 	}
	// })
}

export const removeProgramEdge = () => {

}