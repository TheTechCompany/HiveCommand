import React, { useState } from 'react';
import { Box, Button, Text, List } from 'grommet'
import { Add } from '@mui/icons-material';
import { useQuery, gql } from '@apollo/client';
import { IconButton } from '@mui/material';

export const Alarms = (props) => {
	// const [ alarms, setAlarms ] = useState<any[]>([])
	

	const { data } = useQuery(gql`
		query Q ($id: ID){
			commandPrograms(where: {id: $id}) {
				alarms {
					id
					name
				}
			}
		}
	`)

	const alarms = data?.commandPrograms?.[0]?.alarms || [];

	return (
		<Box flex>

			<Box align="center" justify="between" direction="row">
				<Text></Text>
				<IconButton>
					<Add fontSize='small' />
				</IconButton>
			</Box>
			<List
				data={alarms} />
		</Box>
	)
}