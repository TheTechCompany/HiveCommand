import React from 'react';
import { Box, Typography } from '@mui/material';

export const EmptyView = (props) => {
	return (
		<Box
			sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Typography>Select a {props.label} from the menu on the left to get started...</Typography>
		</Box>
	)
}