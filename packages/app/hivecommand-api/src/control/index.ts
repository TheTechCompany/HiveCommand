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

/*
	Perform action on controlled device
*/
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


/* 
	Change the operating mode for the controller.
*/
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

/*
	Change the state of the controller.

	@param state {string} - The state to set. Valid values are: "on", "off", "standby"
*/
export const useChangeState = (deviceId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {state: string}) => {

		const item = mutation.changeState({
			deviceId,
			state: args.state
		})

		return {
			item
		}
	})

	return async (state: "on" | "off" | "standby") => {
		return await mutateFn({
			args: {
				state
			}
		})
	}
}

/*
	Request flow to run
*/
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

