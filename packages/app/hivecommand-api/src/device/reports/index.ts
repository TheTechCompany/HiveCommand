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
		const item = mutation.createCommandDeviceReport({
			input: {
				type: args.type,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,
				total: args.total,

				dataDevice: args.templateId,
				dataKey: args.keyId,
				
				device: deviceId
			}
		})
	
		return {
			item: {
				...item
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
			input: {
				type: args.type,
				total: args.total,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,
				dataDevice: args.templateId,
				dataKey: args.keyId
			}
		})

		return {
			item: {
				...item
			}
		}
	})
	return (id: string, type: string, templateId: string, keyId: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
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
	const [ addGraph ] = useMutation((mutation, args: {items: {
		id: string,
		x: number,
		y: number,
		w: number,
		h: number,
	}[]}) => {

		const item = mutation.updateCommandDeviceReportGrid({
			device: deviceId,
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

		const item = mutation.deleteCommandDeviceReport({id: args.id})
		
		return {
			item: {
				...item
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