import { gql, useMutation } from "@apollo/client"


export const createHMIAction = async (
	program: string,
	name: string,
	flow: string[]
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation ($program: ID, $hmi_id: ID, $name: String, $flow: [String]) {
			updateCommandPrograms(
				where: {node: {id: $program}},
				update: {
					hmi: [{
						where: {id: $hmi_id},
						update: {
							actions: [{
								create: [{
									node: {
										name: $name,
										flow: {
											connect: [${flow.map((f) => `{where: {id: "${f}"}}`).join(",")}]
										}
									}
								}]
							}]
						}
					}]
				}
			)
		}
	`)

	return await mutateFn({
		variables: {
			program,
			name,
			flow,
		}
	})
}


export const createHMIGroup = async (nodes: any[], ports: any[]) => {

}

export const updateHMIGroup = async (id: string, x: number, y: number) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation updateHMIGroup (id: ID, x: Float, y: Float) {
			updateCommandHMIGroups({
				where: {id: $id},
				update: {
					x: $x,
					y: $y,
				}
			}){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			id,
			x,
			y
		}
	})
}

export const createHMINode = async (
	program: string,
	type: string,
	x: number,
	y: number
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation createHMINode($program: ID!, $type: String!, $x: Float!, $y: Float!) {
			updateCommandPrograms({
				where: {id: $program},
				update: {
					hmi: [{
						where: {node: {id: $activeProgram}},
						update: {
							node: {
								nodes: {
									nodes: [{
										create: [{
											node: {
												type: {
													connect: {where: {node: {name: $type}}},
													x: $x,
													y: $y
												}
											}
										}]
									}]
								}
							}
						}
					}]			
				}
			}){
				id
				name
				nodes {
					id
				}
			}
		}
	`)

	return await mutateFn({
		variables: {
			program,
			type,
			x,
			y
		}
	})
}

export const updateHMINode = async (program: string, node_id: string, x: number, y: number) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation updateHMINode($program: ID!, $node_id: ID!, $x: Float!, $y: Float!) {
			updateCommandPrograms({
				where: {id: $program},
				update: {
					hmi: [{
						where: {node: {id: $activeProgram}},
						update: {
							nodes: [{
								where: {id: $node_id},
								update: {
									x: $x,
									y: $y
								}
							}]
						}
					}]
				}
			}){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			program,
			node_id,
			x,
			y

		}
	})
}

export const updateHMINodeScale = async (program: string, node_id: string, scale: {x?: number, y?: number}) => {
	let query = []
	
	if(scale.x) query.push(`scaleX: $scaleX`)
	if(scale.y) query.push(`scaleY: $scaleY`)
	const [ mutateFn, info ] = useMutation(gql`
			mutation updateHMINodeRotation($program: ID!, $node_id: ID!, $scale: Float!) {
				updateCommandPrograms({
					where: {id: $program},
					update: {
						hmi: [{
							where: {node: {id: $hmi_id}},
							update: {
								nodes: [{
									where: {node: {id: $node_id}},
									${query.join(', ')}
								}]
							}
						}]
					}
				}){
					id
				}
			}
		`)
	
		return await mutateFn({
			variables: {
				program,
				node_id,
				scale
			}
		})
}

export const updateHMINodeRotation = async (program: string, node_id: string, rotation: number) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation updateHMINodeRotation($program: ID!, $node_id: ID!, $rotation: Float!) {
			updateCommandPrograms({
				where: {id: $program},
				update: {
					hmi: [{
						where: {node: {id: $hmi_id}},
						update: {
							nodes: [{
								where: {node: {id: $node_id}},
								rotation: $rotation
							}]
						}
					}]
				}
			}){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			program,
			node_id,
			rotation
		}
	})
}

export const connectHMINode = async (
	program: string,
	node_id: string,
	source: string,
	sourceHandle: string,
	target: string,
	targetHandle: string,
	points: {x: number, y: number}[]
) => {
	let path_query = ``;

	// if()
	const [ mutateFn, info ] = useMutation(gql`
		mutation ($program: ID) {
			updateCommandPrograms(
				where: {id: $program},
				update: {
					hmi: [{
						where: {node: {id: $activeProgram}},
						update: {
							paths: [${path_query}]
						}
					}]
				}
			)
		}
	`)

	return await mutateFn({
		variables: {
			program,
			node_id,
			source,
			sourceHandle,
			target,
			targetHandle,
			points
		}
	})
}

export const assignHMINode = async (program: string, node_id: string, device_id: string) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation assignHMINode($program: ID!, $node_id: ID!, $device_id: ID!) {
			updateCommandPrograms(
				where: {id: $program},
				update: {
					hmi: [{
						where: {node: {id: $activeProgram}},
						update: {
							node: {
								nodes: [{
									where: {id: $node_id},
									update: {
										devicePlaceholder: {
											connect: {
												where: {
													node: {id: $device_id},
												}
											}
										}
									}
								}]
							}
						}
					}]
			
				}
			){
				id
				name
			}
		}
	`)

	return await mutateFn({
		variables: {
			program,
			node_id,
			device_id,
			activeProgram: program
		}
	})
}