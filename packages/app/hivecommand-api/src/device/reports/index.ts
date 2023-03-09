import { mutate, useMutation } from '../../gqty'


export const useCreateReportPage = (deviceId: string) => {

	const [ addReportPage ] = useMutation((mutation, args: {name: string}) => {
		const item = mutation.createCommandReportPage({
			device: deviceId,
			input: {
				name: args.name
			}
		})
		return {
			item: {
				...item
			}
		}
	})
	return (name: string) => {
		return addReportPage({args: {name}})
	}
}


export const useUpdateReportPage = (deviceId: string) => {

	const [ updateReportPage ] = useMutation((mutation, args: {id: string, name: string}) => {
		const item = mutation.updateCommandReportPage({
			device: deviceId,
			id: args.id,
			input: {
				name: args.name
			}
		})
		return {
			item: {
				...item
			}
		}
	})
	return (id: string, name: string) => {
		return updateReportPage({args: {id: id, name}})
	}
}


export const useRemoveReportPage = (deviceId: string) => {

	const [ removeReportPage ] = useMutation((mutation, args: {id: string}) => {
		const item = mutation.deleteCommandReportPage({
			device: deviceId,
			id: args.id
		})
		return {
			item: {
				...item
			}
		}
	})
	return (id: string) => {
		return removeReportPage({args: {id}})
	}
}


export const useAddDeviceChart = (deviceId: string) => {
	const [ addGraph ] = useMutation((mutation, args: {
		page: string,

		type: string,
		templateId: string,
		keyId: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.createCommandDeviceReport({
			page: args.page,
			input: {
				type: args.type,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,
				total: args.total,

				tagId: args.templateId,
				subkeyId: args.keyId,
				
				device: deviceId
			}
		})
	
		return {
			item: {
				...item
			}
		}
	})
	return (page: string, type: string, templateId: string, keyId: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				page: page,
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
		page: string,
		id: string,
		type: string,
		templateId: string,
		keyId: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.updateCommandDeviceReport({
			id: args.id,
			page: args.page,
			input: {
				type: args.type,
				total: args.total,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,

				tagId: args.templateId,
				subkeyId: args.keyId
			}
		})

		return {
			item: {
				...item
			}
		}
	})
	return (page: string, id: string, type: string, templateId: string, keyId: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				page,
				id,
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
	const [ addGraph ] = useMutation((mutation, args: {
		page: string,
		items: {
			id: string,
			x: number,
			y: number,
			w: number,
			h: number,
		}[]
	}) => {

		const item = mutation.updateCommandDeviceReportGrid({
			device: deviceId,
			page: args.page,
			grid: args.items.map((item) => ({
				id: item.id,
				x: item.x,
				y: item.y,
				width: item.w,
				height: item.h
			}))
		})


		return {
			item: [
				...item || []
			]
		}
	})
	return (page: string, items: {id: string,  x: number, y: number, w: number, h: number}[]) => {
		return addGraph({
			args: {
				page,
				items
			}
		})
	}
}


export const useRemoveDeviceChart = (deviceId: string) => {

	const [ removeGraph ] = useMutation((mutation, args: {
		id: string,
		page: string
	}) => {

		const item = mutation.deleteCommandDeviceReport({
			page: args.page,
			id: args.id
		})
		
		return {
			item: {
				...item
			}
		}
	})
	return (page: string, id: string) => {
		return removeGraph({
			args: {
				page,
				id: id
			}
		})
	}
}