import { useMutation } from '../../gqty'

export const useAddDeviceChart = (deviceId: string) => {
	const [ addGraph ] = useMutation((mutation, args: {
		type: string,
		templateId: string,
		keyId: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.updateCommandDevices({
			where: {id: deviceId},
			update: {
				reporting: [{
					create: [{
						node: {
							type: args.type,
							templateDevice: {
								connect: {
									where: {
										node: {id: args.templateId}
									}
								}
							},
							templateKey: {
								connect: {
									where: {
										node: {id: args.keyId}
									}
								}
							},
							x: args.x || 0,
							y: args.y || 0,
							w: args.w || 2,
							h: args.h || 1,
							total: args.total || false
						}
					}]
				}]
			}
		})
		return {
			item: {
				...item.commandDevices?.[0]
			}
		}
	})
	return (type: string, templateId: string, keyId: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				type,
				templateId,
				keyId,
				x,
				y,
				w,
				h,
				total
			}
		})
	}
}

export const useUpdateDeviceChart = (deviceId: string) => {
	const [ addGraph ] = useMutation((mutation, args: {
		type: string,
		templateId: string,
		keyId: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.updateCommandDevices({
			where: {id: deviceId},
			update: {
				reporting: [{
				
					update: {
						node: {
							type: args.type,
							templateDevice: {
								connect: {
									where: {
										node: {id: args.templateId}
									}
								},
								disconnect: {
									where: {
										node: {id_NOT: args.templateId}
									}
								}
							},
							templateKey: {
								connect: {
									where: {
										node: {id: args.keyId}
									}
								},
								disconnect: {
									where: {
										node: {id_NOT: args.keyId}
									}
								}
							},
							x: args.x || 0,
							y: args.y || 0,
							w: args.w || 2,
							h: args.h || 1,
							total: args.total || false
						}
					}
				}]

			}
		})
		return {
			item: {
				...item.commandDevices?.[0]
			}
		}
	})
	return (type: string, templateId: string, keyId: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				type,
				templateId,
				keyId,
				x,
				y,
				w,
				h
			}
		})
	}
}


export const useUpdateDeviceChartGrid = (deviceId: string) => {
	const [ addGraph ] = useMutation((mutation, args: {items: {
		id: string,
		x: number,
		y: number,
		w: number,
		h: number,
	}[]}) => {
		const item = mutation.updateCommandDevices({
			where: {id: deviceId},
			update: {
				reporting: args.items.map((arg) => ({
					where: {node: {id: arg.id}},
					update: {
						node: {
							x: arg.x || 0,
							y: arg.y || 0,
							w: arg.w || 2,
							h: arg.h || 1
						}
					}
				}))
			}
		});

		return {
			item: {
				...item.commandDevices?.[0]
			}
		}
	})
	return (items: {id: string,  x: number, y: number, w: number, h: number}[]) => {
		return addGraph({
			args: {
				items
			}
		})
	}
}


export const useRemoveDeviceChart = (deviceId: string) => {

	const [ removeGraph ] = useMutation((mutation, args: {id: string}) => {
		const item = mutation.updateCommandDevices({
			where: {id: deviceId},
			update: {
				reporting: [{
					delete: [{
						where: {
							node: {id: args.id}
						}
					}]
				}]
			}
		})
		return {
			item: {
				...item.commandDevices?.[0]
			}
		}
	})
	return (id: string) => {
		return removeGraph({
			args: {
				id: id
			}
		})
	}
}