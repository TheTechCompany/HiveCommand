import { nanoid } from "nanoid"
import { CommandAssertionInput, mutation, useMutation } from "../../gqty"

export const useCreateProgramPlaceholder = (programId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		name: string,
		type: string,
		requiresMutex: boolean,
	}) => {
		const item = mutation.createCommandProgramDevice({
			program: programId,
			input: {
				tag: args.name,
				template: args.type
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		create: [{
			// 			node: {
			// 				name: args.name,
			// 				type: { connect: {where: {node: {id: args.type }}}},
			// 				requiresMutex: args.requiresMutex
			// 			}
			// 		}]
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})

	return async (
		name: string,
		type: string,
		requiresMutex?: boolean
	) => {
		return await mutateFn({
			args: {
				name,
				type,
				requiresMutex: requiresMutex || false
			}
		})
	}
}


export const useUpdateProgramPlaceholder = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		deviceId: string,
		name: string,
		type: string,
		requiresMutex: boolean
	}) => {
		const item = mutation.updateCommandProgramDevice({
			program: programId,
			id: args.deviceId,
			input: {
				tag: args.name,
				template: args.type
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: args.deviceId}},
			// 		update: {
			// 			node: {
			// 				name: args.name,
			// 				type: { connect: {where: {node: {id: args.type }}}, disconnect: {where: {node: {id_NOT: args.type}}}},
			// 				requiresMutex: args.requiresMutex
			// 			}
			// 		}
			// 	}]
			// }
		})

		return {
			item: {
				...item
			}
		}
	})

	return async (
		deviceId: string,
		name: string,
		type: string,
		requiresMutex?: boolean
	) => {
		return await mutateFn({
			args: {
				deviceId,
				name,
				type,
				requiresMutex: requiresMutex || false
			}
		})
	}
}

export const useConfigureProgramPlaceholder = (programId: string, placeholderId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {units: {id?: string, inputUnit: string, displayUnit: string, state: string}}) => {
		// let update = {};

		// if(args.units.id){
		// 	update = {
		// 		where: {node: {id: args.units.id}},
		// 		update: {
		// 			inputUnit: args.units.inputUnit,
		// 			displayUnit: args.units.displayUnit,
		// 			state: {
		// 				connect: {
		// 					where: {node: {id: args.units.state}}
		// 				},
		// 				disconnect: {
		// 					where: {node: {id_NOT: args.units.state}}
		// 				}
		// 			}
		// 		}
		// 	}
		// }else{
		// 	update = {
		// 		create: [{
		// 			node: {
		// 				inputUnit: args.units.inputUnit,
		// 				displayUnit: args.units.displayUnit,
		// 				state: {
		// 					connect: {
		// 						where: {node: {id: args.units.state}}
		// 					}
		// 				}
		// 			}
		// 		}]
		// 	}
		// }
		// const result = mutation.updateCommandProgramDevicePlaceholders({
		// 	where: {id: placeholderId, program: {id: programId}},
		// 	update: {
		// 		units: [update]
		// 	}
		// })
		// return {
		// 	item: {
		// 		...result.commandProgramDevicePlaceholders?.[0]
		// 	}
		// }
	})
	

	return (units: {id?: string, inputUnit: string, displayUnit: string, state: string}) => {
		if(!units.state) return;
		return mutateFn({
			args: {
				units
			}
		})
	}
}



export const useDeleteProgramPlaceholder = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		deviceId: string
	}) => {
		const item = mutation.deleteCommandProgramDevice({
			program: programId,
			id: args.deviceId
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: args.deviceId}}
			// 	}]
			// }
		})

		return {
			item: {
				success: item
			}
		}
	})

	return async (
		deviceId: string
	) => {
		return await mutateFn({
			args: {
				deviceId
			}
		})
	}
}


export const useUpdatePlaceholderSetpoint = (programId: string, deviceId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		setpointId: string,
		name: string,
		key: string,
		type: string,
		value: string
	}) => {
		const item = mutation.updateCommandProgramDeviceSetpoint({
			program: programId,
			device: deviceId,
			id: args.setpointId,
			input: {
				name: args.name,
				key: args.key,
				type: args.type,
				value: args.value
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				setpoints: [{
			// 					where: {node: {id: args.setpointId}},
			// 					update: {
			// 						node: {
			// 							name: args.name,
			// 							key: {connect: {where: {node: {id: args.key }}}},
			// 							type: args.type,
			// 							value: args.value
			// 						}
			// 					}
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})
	return async (
		setpointId: string,
		name: string,
		type: 'ratio' | 'value',
		key: string,
		value: string
	) => {
		return await mutateFn({
			args: {
				setpointId,
				name,
				type,
				key,
				value
			}
		})
	}
}

export const useCreatePlaceholderSetpoint = (programId: string, deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		name: string,
		key: string,
		type: string,
		value: string
	}) => {
		const item = mutation.createCommandProgramDeviceSetpoint({
			program: programId,
			device: deviceId,
			input: {
				name: args.name,
				type: args.type,
				value: args.value,
				key: args.key
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				setpoints: [{
			// 					create: [{
			// 						node: {
			// 							name: args.name,
			// 							key: {connect: {where: {node: {id: args.key}}}},
			// 							type: args.type,
			// 							value: args.value
			// 						}
			// 					}]
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})

		return {
			item: {
				...item
			}
		}
	})
	return async (
		name: string,
		type: "ratio" | "value",
		key: string,
		value: string
	) => {
		return await mutateFn({
			args: {
				name,
				type,
				key,
				value
			}
		})
	}
}


export const useCreatePlaceholderDataInterlock = (programId: string, deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		type: string,
		inputDevice: string,
		inputDeviceKey: string,
		comparator: string,
		assertion: CommandAssertionInput,
		deviceKey: string
	}) => {

		// let assertionValue = {};
		// if(args.type == "setpoint"){
		// 	assertionValue = {
		// 		setpoint: {connect: {where: {node: {id: args.assertion}}}}
		// 	}
		// }else if(args.type == "value"){
		// 	assertionValue = {
		// 		value: args.assertion
		// 	}
		// }

		const item = mutation.createCommandProgramDataDeviceInterlock({
			program: programId,
			device: deviceId,
			input: {
				inputDevice: args.inputDevice,
				inputDeviceKey: args.inputDeviceKey,
				comparator: args.comparator,
				assertion: args.assertion,
				deviceKey: args.deviceKey
			}	
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				interlocks: [{
			// 					create: [{
			// 						node: {
			// 							inputDevice: {connect: {where: {node: {id: args.inputDevice}}}},
			// 							inputDeviceKey: {connect: {where: {node: {id: args.inputDeviceKey}}}},
			// 							comparator: args.comparator,
			// 							assertion: {create: {node: {type: args.type, ...assertionValue}}},
			// 							action: {connect: {where: {node: {id: args.action}}}},
			// 							state: {
			// 								create: args.state?.map(state => {
			// 									return {
			// 										node : {
			// 											device: {connect: {where: {node: {id: state.device}}}},
			// 											deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
			// 											comparator: state.comparator,
			// 											assertion: {create: {node: {type: 'value', value: state.assertion}}}
			// 										}
			// 									}
			// 								})
			// 							}
			// 						}
			// 					}]
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})
	return async (
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		deviceKey: string,
	) => {
	
		return await mutateFn({
			args: {
				inputDevice: inputDeviceId,
				inputDeviceKey: inputDeviceKeyId,
				type,
				comparator,
				assertion,
				deviceKey,
			}
		})
	}
}

export const useUpdatePlaceholderDataInterlock = (programId: string, deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		interlockId: string,
		inputDevice: string,
		inputDeviceKey: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		deviceKey: string
	}) => {

		let assertionValue = {};
		let notAssertion = {
			delete: {
				// where: {node_NOT: {
				// 	OR: [
				// 		{setpoint: {id: args.assertion}},
				// 		{value: args.assertion}
				// 	]
				// }}
			}
		};
		if(args.type == "setpoint"){
			assertionValue = {
				setpoint: {
					connect: {where: {node: {id: args.assertion}}},
					// disconnect: {where: {node: {id_NOT: args.assertion}}}
				}
			}
		
		}else if(args.type == "value"){
			assertionValue = {
				value: args.assertion
			}

		}

		const item = mutation.updateCommandProgramDataDeviceInterlock({
			program: programId,
			device: deviceId,
			id: args.interlockId,
			input: {
				inputDevice: args.inputDevice,
				inputDeviceKey: args.inputDeviceKey,
				comparator: args.comparator,
				assertion: args.assertion,
				deviceKey: args.deviceKey
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				interlocks: [{
			// 					where: {node: {id: args.interlockId}},
			// 					update: {
			// 						node: {
			// 							inputDevice: {
			// 								connect: {where: {node: {id: args.inputDevice}}},
			// 								disconnect: {where: {node: {id_NOT: args.inputDevice}}}
			// 							},
			// 							inputDeviceKey: {
			// 								connect: {where: {node: {id: args.inputDeviceKey}}},
			// 								disconnect: {where: {node: {id_NOT: args.inputDeviceKey}}}
			// 							},
			// 							comparator: args.comparator,
			// 							assertion: {
										
			// 								...notAssertion,
			// 								create: {node: {type: args.type, ...assertionValue}},
			// 							},
			// 							action: {
			// 								connect: {where: {node: {id: args.action}}}, 
			// 								disconnect: {where: {node: {id_NOT: args.action}}}
			// 							},
			// 							state: [
			// 								{
			// 									create: args.state?.filter((a) => !a.id).map(state => ({
			// 										node: {
			// 											device: {connect: {where: {node: {id: state.device}}}},
			// 											deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
			// 											comparator: state.comparator,
			// 											assertion: {create: {node: {type: 'value', value: state.assertion}}}
			// 										}
			// 									}))
			// 								},
			// 								...(args.state || []).filter((a) => a.id).map(state => ({
			// 										where: {node: {id: state.id}},
			// 										update: {
			// 											node: {
			// 												device: {
			// 													connect: {where: {node: {id: state.device}}},
			// 													disconnect: {where: {node: {id_NOT: state.device}}}
			// 												},
			// 												deviceKey: {
			// 													connect: {where: {node: {id: state.deviceKey}}},
			// 													disconnect: {where: {node: {id_NOT: state.deviceKey}}}
			// 												},
			// 												comparator: state.comparator,
			// 												assertion: {update: {node: {value: state.assertion}}}
			// 											}
			// 										}
			// 								}))
			// 							]
			// 							// .concat()
			// 						}
			// 					}
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})
	return async (
		interlockId: string,
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		deviceKey: string,
	) => {
		return await mutateFn({
			args: {
				interlockId,
				inputDevice: inputDeviceId,
				inputDeviceKey: inputDeviceKeyId,
				type,
				comparator,
				assertion,
				deviceKey
			}
		})
	}
}

export const useDeletePlaceholderDataInterlock  = (programId: string, deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {interlockId: string}) => {

		const item = mutation.deleteCommandProgramDataDeviceInterlock({
			program: programId,
			device: deviceId,
			id: args.interlockId
			// where: {id: deviceId, program: {id: programId}},
			// update: {
			// 	interlocks: [{
			// 		delete: [{where: {node: {id: args.interlockId}}}]
			// 	}]
			// }
		})

		return {
			item: {
				success: item
			}
		}
	})

	return async (id: string) => {
		return await mutateFn({
			args: {
				interlockId: id
			}
		})
	}
}

export const useCreatePlaceholderInterlock = (programId: string, deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		type: string,
		inputDevice: string,
		inputDeviceKey: string,
		comparator: string,
		assertion: CommandAssertionInput,
		action: string,
		state?: {device: string, deviceKey: string, comparator: string, assertion: string}[]
	}) => {

		// let assertionValue = {};
		// if(args.type == "setpoint"){
		// 	assertionValue = {
		// 		setpoint: {connect: {where: {node: {id: args.assertion}}}}
		// 	}
		// }else if(args.type == "value"){
		// 	assertionValue = {
		// 		value: args.assertion
		// 	}
		// }

		const item = mutation.createCommandProgramDeviceInterlock({
			program: programId,
			device: deviceId,
			input: {
				inputDevice: args.inputDevice,
				inputDeviceKey: args.inputDeviceKey,
				comparator: args.comparator,
				assertion: args.assertion,
				action: args.action
			}	
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				interlocks: [{
			// 					create: [{
			// 						node: {
			// 							inputDevice: {connect: {where: {node: {id: args.inputDevice}}}},
			// 							inputDeviceKey: {connect: {where: {node: {id: args.inputDeviceKey}}}},
			// 							comparator: args.comparator,
			// 							assertion: {create: {node: {type: args.type, ...assertionValue}}},
			// 							action: {connect: {where: {node: {id: args.action}}}},
			// 							state: {
			// 								create: args.state?.map(state => {
			// 									return {
			// 										node : {
			// 											device: {connect: {where: {node: {id: state.device}}}},
			// 											deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
			// 											comparator: state.comparator,
			// 											assertion: {create: {node: {type: 'value', value: state.assertion}}}
			// 										}
			// 									}
			// 								})
			// 							}
			// 						}
			// 					}]
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})
	return async (
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		action: string,
		state?: {device: string, deviceKey: string, comparator: string, assertion: string}[]
	) => {
	
		return await mutateFn({
			args: {
				inputDevice: inputDeviceId,
				inputDeviceKey: inputDeviceKeyId,
				type,
				comparator,
				assertion,
				action,
				state
			}
		})
	}
}

export const useUpdatePlaceholderInterlock = (programId: string, deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		interlockId: string,
		inputDevice: string,
		inputDeviceKey: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		action: string,
		state?: {id?: string, device: string, deviceKey: string, comparator: string, assertion: string}[]
	}) => {
		if(!args.action) return;

		let assertionValue = {};
		let notAssertion = {
			delete: {
				// where: {node_NOT: {
				// 	OR: [
				// 		{setpoint: {id: args.assertion}},
				// 		{value: args.assertion}
				// 	]
				// }}
			}
		};
		if(args.type == "setpoint"){
			assertionValue = {
				setpoint: {
					connect: {where: {node: {id: args.assertion}}},
					// disconnect: {where: {node: {id_NOT: args.assertion}}}
				}
			}
		
		}else if(args.type == "value"){
			assertionValue = {
				value: args.assertion
			}

		}

		const item = mutation.updateCommandProgramDeviceInterlock({
			program: programId,
			device: deviceId,
			id: args.interlockId,
			input: {
				inputDevice: args.inputDevice,
				inputDeviceKey: args.inputDeviceKey,
				comparator: args.comparator,
				assertion: args.assertion,
				action: args.action
			}
			// where: {id: programId},
			// update: {
			// 	devices: [{
			// 		where: {node: {id: deviceId}},
			// 		update: {
			// 			node: {
			// 				interlocks: [{
			// 					where: {node: {id: args.interlockId}},
			// 					update: {
			// 						node: {
			// 							inputDevice: {
			// 								connect: {where: {node: {id: args.inputDevice}}},
			// 								disconnect: {where: {node: {id_NOT: args.inputDevice}}}
			// 							},
			// 							inputDeviceKey: {
			// 								connect: {where: {node: {id: args.inputDeviceKey}}},
			// 								disconnect: {where: {node: {id_NOT: args.inputDeviceKey}}}
			// 							},
			// 							comparator: args.comparator,
			// 							assertion: {
										
			// 								...notAssertion,
			// 								create: {node: {type: args.type, ...assertionValue}},
			// 							},
			// 							action: {
			// 								connect: {where: {node: {id: args.action}}}, 
			// 								disconnect: {where: {node: {id_NOT: args.action}}}
			// 							},
			// 							state: [
			// 								{
			// 									create: args.state?.filter((a) => !a.id).map(state => ({
			// 										node: {
			// 											device: {connect: {where: {node: {id: state.device}}}},
			// 											deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
			// 											comparator: state.comparator,
			// 											assertion: {create: {node: {type: 'value', value: state.assertion}}}
			// 										}
			// 									}))
			// 								},
			// 								...(args.state || []).filter((a) => a.id).map(state => ({
			// 										where: {node: {id: state.id}},
			// 										update: {
			// 											node: {
			// 												device: {
			// 													connect: {where: {node: {id: state.device}}},
			// 													disconnect: {where: {node: {id_NOT: state.device}}}
			// 												},
			// 												deviceKey: {
			// 													connect: {where: {node: {id: state.deviceKey}}},
			// 													disconnect: {where: {node: {id_NOT: state.deviceKey}}}
			// 												},
			// 												comparator: state.comparator,
			// 												assertion: {update: {node: {value: state.assertion}}}
			// 											}
			// 										}
			// 								}))
			// 							]
			// 							// .concat()
			// 						}
			// 					}
			// 				}]
			// 			}
			// 		}
			// 	}]
			// }
		})
		return {
			item: {
				...item
			}
		}
	})
	return async (
		interlockId: string,
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: CommandAssertionInput,
		action: string,
		state?: {device: string, deviceKey: string, comparator: string, assertion: string}[]
	) => {
		return await mutateFn({
			args: {
				interlockId,
				inputDevice: inputDeviceId,
				inputDeviceKey: inputDeviceKeyId,
				type,
				comparator,
				assertion,
				action,
				state
			}
		})
	}
}

export const useDeletePlaceholderInterlock  = (programId: string, deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {interlockId: string}) => {

		const item = mutation.deleteCommandProgramDeviceInterlock({
			program: programId,
			device: deviceId,
			id: args.interlockId
			// where: {id: deviceId, program: {id: programId}},
			// update: {
			// 	interlocks: [{
			// 		delete: [{where: {node: {id: args.interlockId}}}]
			// 	}]
			// }
		})

		return {
			item: {
				success: item
			}
		}
	})

	return async (id: string) => {
		return await mutateFn({
			args: {
				interlockId: id
			}
		})
	}
}

export const useCreatePlaceholderPlugin = (programId: string, deviceId: string) => {

	const [mutateFn] = useMutation((mutation, args: { 
		rules: string, 
		plugin: string, 
		configuration: any 
	}) => {
			let conf = [];

			if (args.configuration) {
				for (var k in args.configuration) {
					conf.push({ key: k, value: args.configuration[k] })
				}
			}

			let ruleUpdate = {};

			if(args.rules){
				ruleUpdate = {
					rules: {connect: {where: {node: {id: args.rules}}}}
				}
				
			}


			const item = mutation.createCommandProgramDevicePlugin({
				program: programId,
				device: deviceId,
				input: {
					plugin: args.plugin,
					rules: args.rules,
					config: conf
				}
				// where: {id: deviceId, program: {id: programId}},
				// update: {
				// 	...pluginUpdate
				// }
			})

			// const item = mutation.updateCommandProgramDevicePlaceholders({
			// 	where: { id: deviceId },
			// 	update: {
			// 		...pluginUpdate,
			// 	}
			// })

			return {
				item: {
					...item
				}
			}
	})

	return (plugin: string, rules: string, configuration: any) => {
		return mutateFn({
			args: {
				plugin,
				configuration,
				rules,
			}
		})
	}

}


export const useUpdatePlaceholderPlugin = (programId: string, deviceId: string) => {

	const [mutateFn] = useMutation((mutation, args: { 
		id: string, 
		rules: string, 
		plugin: string, 
		configuration: any 
	}) => {
			let conf = [];

			if (args.configuration) {
				for (var k in args.configuration) {
					conf.push({ key: k, value: args.configuration[k] })
				}
			}


			const item = mutation.updateCommandProgramDevicePlugin({
				program: programId,
				device: deviceId,
				id: args.id,
				input: {
					plugin: args.plugin,
					rules: args.rules,
					config: conf
				}
				// where: {id: deviceId, program: {id: programId}},
				// update: {
				// 	...pluginUpdate
				// }
			})

			// const item = mutation.updateCommandProgramDevicePlaceholders({
			// 	where: { id: deviceId },
			// 	update: {
			// 		...pluginUpdate,
			// 	}
			// })

			return {
				item: {
					...item
				}
			}
	})

	return (id: string, plugin: string, rules: string, configuration: any) => {
		return mutateFn({
			args: {
				plugin,
				configuration,
				rules,
				id
			}
		})
	}

}