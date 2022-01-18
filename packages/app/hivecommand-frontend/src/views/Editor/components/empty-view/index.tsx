import { Box, Text } from 'grommet';
import React from 'react';

export const EmptyView = (props) => {
	return (
		<Box
			flex 
			align='center' 
			justify='center'>
			<Text>Select a {props.label} from the menu on the left to get started...</Text>
		</Box>
	)
}