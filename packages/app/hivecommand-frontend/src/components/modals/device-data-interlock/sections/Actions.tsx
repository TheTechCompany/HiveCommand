import React, { useContext } from 'react';
import { Box } from 'grommet';
import { FormControl } from '@hexhive/ui';
import { DeviceInterlockContext } from '../context';

export const ActionSection = (props) => {
	const { interlock, actions, device, setInterlock } = useContext(DeviceInterlockContext)

	return (
		<Box>
			<FormControl
				labelKey="key"
				valueKey={"id"}
				value={interlock.deviceKey}
				onChange={(value) => setInterlock({ ...interlock, deviceKey: value })}
				options={device?.type?.state || []}
				placeholder="Device Key" />
		</Box>
	)
}