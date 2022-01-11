import { useMutation } from "../gqty"

export * from './calibration'


export const useChangeDeviceMode = (deviceId: string) => {
	
	const [ mutateFn ] = useMutation((mutation, args: {mode: string, deviceName: string}) => {
		const item = mutation.changeDeviceMode({
			deviceId,
			mode: args.mode,
			deviceName: args.deviceName
		})
		return {
			item
		}
	})
	return async (
		deviceName: string,
		mode: string
	) => {
		return await mutateFn({
			args: {
				deviceName,
				mode
			}
		})
	}
}

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

export const usePerformDeviceAction = (deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {action: string, deviceName: string}) => {
		const item = mutation.performDeviceAction({
			deviceId,
			action: args.action,
			deviceName: args.deviceName
		})
		return {
			item
		}
	})

	return async (
		deviceName: string,
		action: string
	) => {
		return await mutateFn({
			args: {
				deviceName,
				action
			}
		})
	}
}

export const useChangeMode = (deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {mode: string}) => {
		const item = mutation.changeMode({
			deviceId,
			mode: args.mode
		})
		return {
			item: item
		}
	})

	return async (mode: string) => {
		return await mutateFn({
			args: {
				mode
			}
		})
	}
}



export const useRequestFlow = (deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {actionId: string}) => {
		const item = mutation.requestFlow({
			deviceId,
			actionId: args.actionId
		})
		return {
			item
		}
	})
	return async (
		actionId: string
	) => {
		return await mutateFn({
			args: {
				actionId
			}
		})
	}
}

