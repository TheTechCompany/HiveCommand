import { useMutation } from "../gqty"

export const useChangeDeviceValue = (deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {deviceName: string, key: string, value: string}) => {
		const item = mutation.changeDeviceValue({
			deviceId,
			deviceName: args.deviceName,
			key: args.key,
			value: args.value
		})
		return {
			item
		}
	})
	return async (
		deviceName: string,
		key: string,
		value: any
	) => {
		return await mutateFn({
			args: {
				deviceName,
				key,
				value
			}
		})
	}
}
