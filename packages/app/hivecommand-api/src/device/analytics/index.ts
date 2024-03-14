import { mutate, useMutation } from '../../gqty'
import { useMutation as useApolloMutation, gql } from '@apollo/client'

export const useDownloadAnalytic = (deviceId: string) => {
	const [ download ] = useApolloMutation(gql`
		mutation Download ($page: ID, $id: ID, $startDate: DateTime, $endDate: DateTime, $bucket: String){
			downloadCommandDeviceAnalytic(page: $page, id: $id, startDate: $startDate, endDate: $endDate, bucket: $bucket)
		}
	`)
	return async (page: string, id: string, startDate: Date, endDate: Date, bucket: string) => {
		return await download({
			variables: {
				page,
				id,
				startDate,
				endDate,
				bucket
			}
		})

	}
}

export const useCreateAnalyticPage = (deviceId: string) => {

	const [ addAnalyticPage ] = useMutation((mutation, args: {name: string}) => {
		const item = mutation.createCommandAnalyticPage({
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
		return addAnalyticPage({args: {name}})
	}
}


export const useUpdateAnalyticPage = (deviceId: string) => {

	const [ updateAnalyticPage ] = useMutation((mutation, args: {id: string, name: string}) => {
		const item = mutation.updateCommandAnalyticPage({
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
		return updateAnalyticPage({args: {id: id, name}})
	}
}


export const useRemoveAnalyticPage = (deviceId: string) => {

	const [ removeAnalyticPage ] = useMutation((mutation, args: {id: string}) => {
		const item = mutation.deleteCommandAnalyticPage({
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
		return removeAnalyticPage({args: {id}})
	}
}


export const useAddDeviceChart = (deviceId: string) => {
	const [ addGraph ] = useMutation((mutation, args: {
		page: string,

		type: string,
		templateId: string,
		keyId: string,
		unit: string,
		timeBucket: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.createCommandDeviceAnalytic({
			page: args.page,
			input: {
				type: args.type,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,
				total: args.total,
				unit: args.unit,
				tagId: args.templateId,
				subkeyId: args.keyId,
				timeBucket: args.timeBucket,
				device: deviceId
			}
		})
	
		return {
			item: {
				...item
			}
		}
	})
	return (page: string, type: string, templateId: string, keyId: string, unit: string, timeBucket: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				page: page,
				type,
				templateId,
				keyId,
				unit,
				x,
				y,
				w,
				h,
				total,
				timeBucket
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
		unit: string,
		timeBucket: string,
		x: number,
		y: number,
		w: number,
		h: number,
		total?: boolean
	}) => {
		const item = mutation.updateCommandDeviceAnalytic({
			id: args.id,
			page: args.page,
			input: {
				type: args.type,
				total: args.total,
				x: args.x,
				y: args.y,
				width: args.w,
				height: args.h,
				unit: args.unit,
				timeBucket: args.timeBucket,
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
	return (page: string, id: string, type: string, templateId: string, keyId: string, unit: string, timeBucket: string, x: number, y: number, w: number, h: number, total?: boolean) => {
		return addGraph({
			args: {
				page,
				id,
				type,
				templateId,
				keyId,
				unit,
				timeBucket,
				x,
				y,
				w,
				h,
				total
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

		const item = mutation.updateCommandDeviceAnalyticGrid({
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

		const item = mutation.deleteCommandDeviceAnalytic({
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