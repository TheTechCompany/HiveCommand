import { gql, useMutation } from "@apollo/client"

export const updateDeviceCalibrations = async (
	deviceId: string,
	calibrations: {
		id?: string;
		device: string;
		deviceKey: string;
		min: string;
		max: string;
	}[]
) => {

	const [ mutateFn, info ] = useMutation(gql`
		mutation ($deviceId: ID!) {
			updateCommandDevices(
				where: {id: $deviceId},
				update: {
					calibrations: [
						{
							create: [
								${calibrations.filter((a) => !a.id).map(calibration => `{
									node: {
										device: {connect: {where: {node: {id: "${calibration.device}"}}}},
										deviceKey: {connect: {where: {node: {key: "${calibration.deviceKey}"}}}},
										min: "${calibration.min}",
										max: "${calibration.max}"
									}
								}`)}
							]
						},
						${calibrations.filter((a) => a.id).map((calibration) => {
						
						return `
							{
								where: {node: {id: "${calibration.id}"}},
								update: {
									node: {
										min: "${calibration.min}",
										max: "${calibration.max}"
									}
								}
							}
						`
					}).join(',')}]
				}
			)
		}
	`)

	return await mutateFn({
		variables: {
			deviceId,
			calibrations,
		}
	})
}