import { useMutation } from "../gqty"

export const useUpdateDeviceCalibrations = (
	deviceId: string
) => {

	
	const [ mutateFn ] = useMutation((mutation, args: {
		calibration:  {
			id?: string;
			placeholder: string;
			stateItem: string;
			min: string;
			max: string;
		} }) => {

		
		let item: any;

		if(args.calibration.id){
			item = mutation.updateCommandDeviceCalibration({
				device: deviceId, id: args.calibration.id, input: {
					min: args.calibration.min,
					max: args.calibration.max,
					placeholder: args.calibration.placeholder,
					stateItem: args.calibration.stateItem
				}
			})
		}else{
			item = mutation.createCommandDeviceCalibration({
				device: deviceId,
				input: {
					min: args.calibration.min,
					max: args.calibration.max,
					placeholder: args.calibration.placeholder,
					stateItem: args.calibration.stateItem
				}
			})
		}

		return {
			item: {
				...item
			}
		}
	})
		
	// const [ mutateFn, info ] = useMutation(gql`
	// 	mutation ($deviceId: ID!) {
	// 		updateCommandDevices(
	// 			where: {id: $deviceId},
	// 			update: {
	// 				calibrations: [
	// 					{
	// 						create: [
	// 							${calibrations.filter((a) => !a.id).map(calibration => `{
	// 								node: {
	// 									device: {connect: {where: {node: {id: "${calibration.device}"}}}},
	// 									deviceKey: {connect: {where: {node: {key: "${calibration.deviceKey}"}}}},
	// 									min: "${calibration.min}",
	// 									max: "${calibration.max}"
	// 								}
	// 							}`)}
	// 						]
	// 					},
	// 					${calibrations.filter((a) => a.id).map((calibration) => {
						
	// 					return `
	// 						{
	// 							where: {node: {id: "${calibration.id}"}},
	// 							update: {
	// 								node: {
	// 									min: "${calibration.min}",
	// 									max: "${calibration.max}"
	// 								}
	// 							}
	// 						}
	// 					`
	// 				}).join(',')}]
	// 			}
	// 		)
	// 	}
	// `)

	return async (
		calibration: {
			id?: string;
			placeholder: string;
			stateItem: string;
			min: string;
			max: string;
		}) => {
		await mutateFn({
			args: {
				calibration,
			}
		})
	}
}