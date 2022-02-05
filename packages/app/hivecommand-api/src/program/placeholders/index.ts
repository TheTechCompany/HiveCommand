import { nanoid } from "nanoid"
import { mutation, useMutation } from "../../gqty"

export const useCreateProgramPlaceholder = (programId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		name: string,
		type: string,
		requiresMutex: boolean,
	}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					create: [{
						node: {
							name: args.name,
							type: { connect: {where: {node: {id: args.type }}}},
							requiresMutex: args.requiresMutex
						}
					}]
				}]
			}
		})
		return {
			item: {
				...item.commandPrograms?.[0]
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
		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: args.deviceId}},
					update: {
						node: {
							name: args.name,
							type: { connect: {where: {node: {id: args.type }}}, disconnect: {where: {node: {id_NOT: args.type}}}},
							requiresMutex: args.requiresMutex
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



export const useDeleteProgramPlaceholder = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
		deviceId: string
	}) => {
		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: args.deviceId}}
				}]
			}
		})

		return {
			item: {
				...item.commandPrograms?.[0]
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
		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: deviceId}},
					update: {
						node: {
							setpoints: [{
								where: {node: {id: args.setpointId}},
								update: {
									node: {
										name: args.name,
										key: {connect: {where: {node: {id: args.key }}}},
										type: args.type,
										value: args.value
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
		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: deviceId}},
					update: {
						node: {
							setpoints: [{
								create: [{
									node: {
										name: args.name,
										key: {connect: {where: {node: {id: args.key}}}},
										type: args.type,
										value: args.value
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
				...item.commandPrograms?.[0]
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

export const useCreatePlaceholderInterlock = (programId: string, deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {
		type: string,
		inputDevice: string,
		inputDeviceKey: string,
		comparator: string,
		assertion: string,
		action: string,
		state?: {device: string, deviceKey: string, comparator: string, assertion: string}[]
	}) => {

		let assertionValue = {};
		if(args.type == "setpoint"){
			assertionValue = {
				setpoint: {connect: {where: {node: {id: args.assertion}}}}
			}
		}else if(args.type == "value"){
			assertionValue = {
				value: args.assertion
			}
		}

		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: deviceId}},
					update: {
						node: {
							interlocks: [{
								create: [{
									node: {
										inputDevice: {connect: {where: {node: {id: args.inputDevice}}}},
										inputDeviceKey: {connect: {where: {node: {id: args.inputDeviceKey}}}},
										comparator: args.comparator,
										assertion: {create: {node: {type: args.type, ...assertionValue}}},
										action: {connect: {where: {node: {id: args.action}}}},
										state: {
											create: args.state?.map(state => {
												return {
													node : {
														device: {connect: {where: {node: {id: state.device}}}},
														deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
														comparator: state.comparator,
														assertion: {create: {node: {type: 'value', value: state.assertion}}}
													}
												}
											})
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
				...item?.commandPrograms?.[0]
			}
		}
	})
	return async (
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: string,
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
		assertion: string,
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

		const item = mutation.updateCommandPrograms({
			where: {id: programId},
			update: {
				devices: [{
					where: {node: {id: deviceId}},
					update: {
						node: {
							interlocks: [{
								where: {node: {id: args.interlockId}},
								update: {
									node: {
										inputDevice: {
											connect: {where: {node: {id: args.inputDevice}}},
											disconnect: {where: {node: {id_NOT: args.inputDevice}}}
										},
										inputDeviceKey: {
											connect: {where: {node: {id: args.inputDeviceKey}}},
											disconnect: {where: {node: {id_NOT: args.inputDeviceKey}}}
										},
										comparator: args.comparator,
										assertion: {
										
											...notAssertion,
											create: {node: {type: args.type, ...assertionValue}},
										},
										action: {
											connect: {where: {node: {id: args.action}}}, 
											disconnect: {where: {node: {id_NOT: args.action}}}
										},
										state: [
											{
												create: args.state?.filter((a) => !a.id).map(state => ({
													node: {
														device: {connect: {where: {node: {id: state.device}}}},
														deviceKey: {connect: {where: {node: {id: state.deviceKey}}}},
														comparator: state.comparator,
														assertion: {create: {node: {type: 'value', value: state.assertion}}}
													}
												}))
											},
											...(args.state || []).filter((a) => a.id).map(state => ({
													where: {node: {id: state.id}},
													update: {
														node: {
															device: {
																connect: {where: {node: {id: state.device}}},
																disconnect: {where: {node: {id_NOT: state.device}}}
															},
															deviceKey: {
																connect: {where: {node: {id: state.deviceKey}}},
																disconnect: {where: {node: {id_NOT: state.deviceKey}}}
															},
															comparator: state.comparator,
															assertion: {update: {node: {value: state.assertion}}}
														}
													}
											}))
										]
										// .concat()
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
	return async (
		interlockId: string,
		inputDeviceId: string,
		inputDeviceKeyId: string,
		type: string,
		comparator: string,
		assertion: string,
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

export const useCreatePlaceholderPlugin = (programId: string, deviceId: string) => {

	const [mutateFn] = useMutation((mutation, args: { 
		id?: string, 
		rules: string, 
		plugin: string, 
		configuration: any 
	}) => {
			let conf = [];

			if (args.configuration) {
				for (var k in args.configuration) {
					conf.push({ id: nanoid(), key: k, value: args.configuration[k] })
				}
			}

			console.log({args})
			let ruleUpdate = {};

			if(args.rules){
				ruleUpdate = {
					rules: {connect: {where: {node: {id: args.rules}}}}
				}
				
			}


			let pluginUpdate = {};

			if(args.id){
				pluginUpdate = {
					plugins: [{
						where: {node: {id: args.id}},
						update: {
							node: {
								plugin: {connect: {where: {node: {id: args.plugin}}}},
								...ruleUpdate,
								configuration: conf.map((c) => ({
									where: {node: {key: c.key}},
									update: {
										node: {
											key: c.key,
											value: c.value
										}
									}
								}))
							}
						}
					}]
				}
			}else{
				pluginUpdate = {
					plugins: [{
						create: {
							node: {
								plugin: {connect: {where: {node: {id: args.plugin}}}},
								...ruleUpdate,
								configuration: {
									create: conf.map((c) => ({
										node: {
											key: c.key,
											value: c.value
										}
									}))
								}
							}
						}
					}]
				}
			}

			const item = mutation.updateCommandProgramDevicePlaceholders({
				where: {id: deviceId, program: {id: programId}},
				update: {
					...pluginUpdate
				}
			})

			// const item = mutation.updateCommandProgramDevicePlaceholders({
			// 	where: { id: deviceId },
			// 	update: {
			// 		...pluginUpdate,
			// 	}
			// })

			return {
				item: {
					...item.commandProgramDevicePlaceholders?.[0]
				}
			}
	})

	return (plugin: string, rules: string, configuration: any, id?: string) => {
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