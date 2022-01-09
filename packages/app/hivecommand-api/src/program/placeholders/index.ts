import { gql, useMutation } from "@apollo/client"


export const createProgramPlaceholder = async (
	programId: string,
	name: string,
	type: string,
	requiresMutex?: boolean
) => {
	const [ mutateFn ] = useMutation(gql`
		mutation createProgramPlaceholder(
			$programId: ID!, 
			$name: String!,
			$requiresMutex: Boolean,
			type: String
		) {
			updateCommandPrograms(where: {id: $programId}, update: {
				devices: [{
					create: [{node: {
						requiresMutex: $requiresMutex,
						name: $name,
						type: {connect: {where: {node: {id: args.type}}}}
					}}]
				}]
			}){
				id
			}
		}
	`)
	return await mutateFn({
		variables: {
			programId,
			name,
			requiresMutex,
			type

		}
	})
}


export const updateProgramPlaceholder = async (
	programId: string,
	deviceId: string,
	name: string,
	type: string,
	requiresMutex?: boolean
) => {
	const [ mutateFn ] = useMutation(gql`
		mutation ($programId: ID!, $deviceId: ID!, $requiresMutex: Boolean, $name: String!, $type: String!) {
			updateCommandPrograms(
				where: {id: $programId}, 
				update: {
					devices: [{
						where: $deviceId,
						update: {
							node: {
								requiresMutex: $requiresMutex,
								name: $name,
								type: {connect: {where: {node: {id: $type}}}}
							}
						}
					}]

				}
			){
				id
			}

		}
	`)

	return await mutateFn({
		variables: {
			programId,
			deviceId,
			requiresMutex,
			name,
			type
		}
	})
}

export const updatePlaceholderSetpoint = async (
	programId: string,
	deviceId: string,
	setpointId: string,
	name: string,
	type: 'ratio' | 'value',
	key: string,
	value: string
) => {

	const [ mutateFn ] = useMutation(gql`
		mutation updatePlaceholderSetpoint($programId: ID!, $deviceId: ID!, $setpointId: ID!, $name: String!, $type: String!, $key: String!, $value: String!){
			updateCommandPrograms(
				where: {id: $programId},
				update: {
					devices: [{
						where: {node: {id: $deviceId}},
						update: {
							setpoints: [{
								where: {node: {id: $setpointId}},
								update: {
									node: {
										name: $name,
										key: {connect: {where: {node: {id: $key}}}},
										type: $type,
										value: $value
									}
								}
							}]
						}
					}]
				}
			){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			programId,
			deviceId,
			setpointId,
			name,
			type,
			key,
			value
		}	
	})
}

export const createPlaceholderSetpoint = async (
	programId: string,
	deviceId: string,
	name: string,
	type: "ratio" | "value",
	key: string,
	value: string
) => {
	const [ mutateFn ] = useMutation(gql`
		mutation createPlaceholderSetpoint($programId: ID!, $deviceId: ID!, $name: String!, $type: String!, $key: String!, $value: String!) {
			updateCommandPrograms(
				where: {id: $programId},
				update: {
					devices: [{
						where: {node: {id: $deviceId}},
						update: {
							setpoints: [{
								create: [{
									node: {
										name: $name,
										key: {connect: {where: {node : {id: $key}}}},
										type: $type,
										value: $value
									}
								}]
							}]
						}
					}]
				}
			){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			programId,
			deviceId,
			name,
			type,
			key,
			value
		}
	})
}

export const createPlaceholderInterlock = async (
	programId: string,
	inputDeviceId: string,
	inputDeviceKeyId: string,
	type: string,
	comparator: string,
	assertion: string,
	action: string
) => {

	const [ mutateFn ] = useMutation(gql`
		mutation createPlaceholderInterlock($programId: String, $deviceId: String, $inputDeviceId: ID!, $inputDeviceKeyId: ID!, $type: String!, $comparator: String!, $assertion: String!, $action: String!) {
			updateCommandPrograms(
				where: {id: $programid},
				update: {
					devices: [{
						where: {node: {id: $inputDeviceId}},
						update: {
							interlocks: [{
								create: [{
									node: {
										type: $type,
										comparator: $comparator,
										assertion: $assertion,
										action: $action,
										key: {connect: {where: {node: {id: $inputDeviceKeyId}}}
									}
								}]
							}]
						}
					}]
				}
			){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			programId,
			inputDeviceId,
			inputDeviceKeyId,
			type,
			comparator,
			assertion,
			action
		}
	})
}

export const updatePlaceholderInterlock = async (
	programId: string,
	interlockId: string,
	inputDeviceId: string,
	inputDeviceKeyId: string,
	type: string,
	comparator: string,
	assertion: string,
	action: string
) => {

	let assertionValue = '';
	if(type == 'setpoint'){
		assertionValue = `, setpoint: {connect: {where: {node: $assertion}}}`;
	}else if(type == 'value'){
		assertionValue = `, value: $assertion`;
	}
	const [ mutateFn ] = useMutation(gql`
		mutation updatePlaceholderInterlock ($interlockId: ID!, $programId: ID!,  $inputDeviceId: ID!, $inputDeviceKeyId: ID!, $type: String!, $comparator: String!, $assertion: String!, $action: String!) {
			updateCommandPrograms(
				where: {id: $programId},
				update: {
					devices: [{
						where: {id: $inputDeviceId},
						update: {
							interlocks: [{
								where: {node: {id: $interlockId}},
								update: {
									node: {
										inputDevice: {connect: {where: {node: {id: $inputDeviceId}}}},
										inputDeviceKey: {connect: {where: {node: {id: $inputDeviceKeyId}}}},
										comparator: $comparator,
										assertion: {create: {node: {type: $type ${assertionValue}}}},
										action: $action
									}
								}
							}]
						}
					}]
				}
			){
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			interlockId: interlockId,
			programId,
			inputDeviceId,
			inputDeviceKeyId,
			type,
			comparator,
			assertion,
			action
		}
	})
}