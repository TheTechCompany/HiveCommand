import React, { useContext } from 'react';
import { Box } from 'grommet';
import { FormControl } from '@hexhive/ui';
import { DeviceInterlockContext } from '../context';

export const ActionSection = (props) => {
	const { interlock, actions, setInterlock } = useContext(DeviceInterlockContext)

	return (
		<Box>
			<FormControl
				labelKey="key"
				valueKey={"id"}
				value={interlock.action}
				onChange={(value) => setInterlock({ ...interlock, action: value })}
				options={actions || []}
				placeholder="Action" />
		</Box>
	)
}