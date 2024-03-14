import { gql, useQuery, useMutation as useApolloMutation} from '@apollo/client'
import { mutate, useMutation } from '../../gqty'


export const useDownloadReport = (deviceId: string) => {
	const [ downloadReport ] = useApolloMutation(gql`
		mutation Download($deviceId: ID, $reportId: ID, $startDate: DateTime, $endDate: DateTime) {
			downloadDeviceReports(device: $deviceId, report: $reportId, startDate: $startDate, endDate: $endDate){
				xlsx
			}
		}
	`, {

	})

	return async (report: string, startDate: Date, endDate: Date) => await downloadReport({
		variables: {
			startDate, 
			endDate,
			deviceId,
			reportId: report
		}});
}

export const useCreateReport = (deviceId: string) => {

	const [ addReport ] = useMutation((mutation, args: {
		name: string,
		recurring: boolean,
		startDate: Date,
		endDate?: Date,
		reportLength?: string
	}) => {
		const item = mutation.createCommandDeviceReport({
			device: deviceId,
			input: {
				name: args.name,
				recurring: args.recurring,
				startDate: args.startDate.toISOString(),
				endDate: args.endDate?.toISOString(),
				reportLength: args.reportLength
			}
		})
		return {
			item: {
				...item
			}
		}
	})
	return (report: {
		name: string, recurring: boolean, startDate: Date, endDate?: Date, reportLength?: string
	}) => {
		return addReport({
			args: {
				...report
			}
		})
	}
}


export const useUpdateReport = (deviceId: string) => {

	const [ updateReport ] = useMutation((mutation, args: {
		id: string,
		name: string,
		recurring: boolean,
		startDate: Date,
		endDate?: Date,
		reportLength?: string
	}) => {
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
	return (
		id: string, 
	report: {
		name: string, recurring: boolean, startDate: Date, endDate?: Date, reportLength?: string
	}) => {
		return updateReport({
			args: {
				id: id,
				...report,
			}})
	}
}


export const useRemoveReport = (deviceId: string) => {

	const [ removeReport ] = useMutation((mutation, args: {id: string}) => {
		const item = mutation.deleteCommandDeviceReport({
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
		return removeReport({args: {id}})
	}
}


export const useCreateReportField = (deviceId: string) => {
	const [ addReportField ] = useMutation((mutation, args: {
		report: string, 
		device?: string,
		key?: string,
		bucket?: string
	}) => {
		const item = mutation.createCommandDeviceReportField({
			report: args.report,
			input: {
				device: args.device,
				key: args.key,
				bucket: args.bucket
			}
		})
	
		return {
			item: {
				...item
			}
		}
	})
	return (report: string, field?: {device: string, key: string, bucket: string}) => {
		return addReportField({
			args: {
				report,
				...field
			}
		})
	}
}

export const useUpdateReportField = (deviceId: string) => {
	const [ updateReportField ] = useMutation((mutation, args: {
		report: string,
		id: string,
		device?: string,
		key?: string,
		bucket?: string
	}) => {
		const item = mutation.updateCommandDeviceReportField({
			id: args.id,
			report: args.report,
			input: {
				device: args.device,
				key: args.key,
				bucket: args.bucket
			}
		})

		return {
			item: {
				...item
			}
		}
	})
	return (report: string, id: string, field?: {device: string, key: string, bucket: string}) => {
		return updateReportField({
			args: {
				report,
				id,
				...field,
			}
		})
	}
}


export const useRemoveReportField = (deviceId: string) => {

	const [ removeField ] = useMutation((mutation, args: {
		id: string,
		page: string
	}) => {

		const item = mutation.deleteCommandDeviceReportField({
			report: args.page,
			id: args.id
		})
		
		return {
			item: {
				...item
			}
		}
	})
	return (page: string, id: string) => {
		return removeField({
			args: {
				page,
				id: id
			}
		})
	}
}