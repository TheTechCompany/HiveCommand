import { gql, useMutation } from "@apollo/client"

export * from './calibration'

export const requestFlow = async (
	deviceId: string,
	actionId: string
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation($deviceId: ID!, $actionId: ID!){
			requestFlow(deviceId: $deviceId, actionId: $actionId)
		}
	`)

	return await mutateFn({
		variables: {
			deviceId,
			actionId
		}
	})
}

export const changeDeviceMode = async (
	deviceId: string,
	deviceName: string,
	mode: string
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation {
			changeDeviceMode(deviceId: $deviceId, deviceName: $deviceName, mode: $mode) 
		}
	`)

	return await mutateFn({
		variables: {
			deviceId,
			deviceName,
			mode
		}
	})
}

export const changeDeviceValue = async (
	deviceId: string,
	deviceName: string,
	key: string,
	value: any
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation {
			changeDeviceValue(deviceId: $deviceId, deviceName: $deviceName, key: $key, value: $value)
		}
	`)

	return await mutateFn({
		variables: {
			deviceId,
			deviceName,
			key,
			value

		}
	})
}

export const changeRootMode = async (mode: string, deviceId: string) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation ($mode: String, $deviceId: String) {
			changeMode(mode: $mode, deviceId: $deviceId)
		}
	`)

	return await mutateFn({
		variables: {
			mode,
			deviceId
		}
	})
}

export const performDeviceAction = async (
	deviceId: string,
	deviceName: string,
	action: string
) => {
	const [ mutateFn, info ] = useMutation(gql`
		mutation {
			performDeviceAction(deviceId: $deviceId, deviceName: $deviceName, action: $action)
		}
	`)

	return await mutateFn({
		variables: {
			deviceId,
			deviceName,
			action
		}
	})
}