import { useMutation } from "../gqty"

/*
	Create new device

	@param {string} name - name of the device
	@param {string} network_name - DNS prefix for the device
	@param {string} program - program id to connect to
*/
export const useCreateDevice = (user: string) => {
	
	const [ mutateFn, info ] = useMutation((mutation, args: {name: string, network_name: string, program?: string}) => {
		let createExtras = {};
		if(args.program) {
			createExtras = {
				activeProgram: {connect: {where: {node: {id: args.program}}}}
			}
		}
		const item = mutation.updateHiveOrganisations({
			where: {members: {id: user}},
			update: {
				commandDevices: [{
					create: [{
						node: {
							name: args.name,
							network_name: args.network_name,
							
						}
					}]
				}]
			}
		})
		return {
			item: {
				...item.hiveOrganisations?.[0]
			}
		}
	})

	return async (name: string, network_name: string, program?: string) => {

		// let query = '';

		// if(program){
		// 	query = `
		// 		createCommandDevices({
		// 			input: [{
		// 				name: $name,
		// 				network_name: $network_name,
		// 				activeProgram: {connect: {where: {node: {id: $program}}}}
		// 			}]
		// 		})`
		// }else{
		// 	query = `
		// 		createCommandDevices({
		// 			input: [{
		// 				name: $name,
		// 				network_name: $network_name
		// 			}]
		// 		})`
		// }
		return mutateFn({args: {name, network_name, program}})
	}
}

/*
	Update device

	@param {string} id - id of the device
	@param {string} name - name of the device
	@param {string} network_name - DNS prefix for the device
	@param {string} program - program id to connect to
*/
export const useUpdateDevice = () => {
	
	const [ mutateFn ] = useMutation((mutation, args: {id: string, name: string, program?: string, network_name: string}) => {
		let programUpdate = {};
		if(args.program){
			programUpdate = {
				activeProgram: {
					disconnect: {
						where: {
							node: {
								id_NOT: args.program
							}
						}
					},
					connect: {
						where: {
							node: {
								id: args.program
							}
						}
					}
				}
			}
		}
		mutation.updateCommandDevices({
			where: {id: args.id},
			update: {
				name: args.name,
				network_name: args.network_name,

			}
		})
	})
	return async (id: string, name: string, network_name: string, program?: string) => {
		
		

		return await mutateFn({
			args: {
				id,
				name,
				network_name,
				program
			}
		})
	}
}

/*
	Map a program device to the actualized device bus

	@param {string} deviceId - id of the device with bus'
	@param {string} peripheralId - id of the bus
	@param {string} port - port index of bus
	@param {string} mapDevice - program device to map

*/
export const mapPort = async (
	deviceId: string,
	peripheralId: string,
	port: string,
	mapDevice: string,
	connections: {key: string, device: string, value: string}[]
) => {

}


// const [ mapPort, mapInfo ] = useMutation((mutation, args: {
// 	id: string, 
// 	port: string, 
// 	peripheralId: string, 

// 	mapping: {id?: string, key: string, device: string, value: string}[],
// 	deviceId: string[],

// }) => {


// 	const device = mutation.updateCommandDevices({
// 		where: {id: args.id},
// 		update: {
// 			peripherals: [{
// 				where: {
// 					node: {
// 						id: args.peripheralId
// 					}
// 				},
// 				update: {
// 					node: {
// 						mappedDevices: [{
// 							create: args.mapping.filter((a) => !a.id).map((map) => {
// 								let keyConnect = map.key ? {  
// 									key: {
// 										connect: {
// 											where: {
// 												node: {
// 													key: map.key, 
// 													product: {peripheral: {id: args.peripheralId}, peripheralConnection: {edge: {port: args.port}}}
// 												}
// 											}
// 										}
// 									}
// 								} : {};

// 								let deviceConnect = map.device ? 
// 								{
// 									device: {
// 										connect: {
// 											where: {
// 												node: {
// 													id: map.device
// 												}
// 											}
// 										}
// 									}
// 								} : {}

// 								let valueConnect = map.value ? {
// 									value: {
// 										connect: {
// 											where: {
// 												node: {
// 													device: {
// 														usedIn: {
// 															id_IN: [map.device]
// 														}
// 													}, 
// 													key: map.value
// 												}
// 											}
// 										}
// 									}
// 								} : {}
// 								return {
// 									node: {
// 										...keyConnect,
// 										...deviceConnect,
// 										...valueConnect
// 									},
// 									edge: {
// 										port: args.port
// 									}
// 								}
// 							}),
					 
// 						}, ...(args.mapping || []).filter((a) => a.id).map((item) => {

// 							return {
// 								where: {node: {id: item.id}},
// 								update: {
// 									node: {
// 										key: {
										  
// 											connect: {
// 												where: {
// 													node: {
// 														key: item.key, 
// 														product: {peripheral: {id: args.peripheralId}, peripheralConnection: {edge: {port: args.port}}}
// 													}
// 												}
// 											}
// 										},
// 										device: {
// 											disconnect: {
// 												where: {
// 													node: {
// 														id_NOT: item.device
// 													}
// 												}
// 											},
// 											connect: {
// 												where: {
// 													node: {
// 														id: item.device
// 													}
// 												}
// 											}
// 										},  
// 										value: {
// 											disconnect: {
// 												where: {
// 													node: {
// 														device: {
// 															id_NOT_IN: [item.device]
// 														},
// 														key_NOT: item.value
// 													}
// 												}
// 											},
// 											connect: {
// 												where: {
// 													node: {
// 														device: {
// 															usedIn: {
// 																id_IN: [item.device]
// 															}
// 														}, 
// 														key: item.value
// 													}
// 												}
// 											}
// 										}
// 									},
								  
// 								}
// 							}
// 						})]
// 					}
// 				}
// 			}]
// 		}
// 	})
// 	return {
// 		item: {
// 			...device.commandDevices?.[0]
// 		},
// 	}
// })