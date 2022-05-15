import { Box, List, Text, Button } from 'grommet';
import { MoreVert, Add } from '@mui/icons-material';
import React from 'react';

export interface ListBoxProps {
	label?: string;
	data?: any[];
	renderItem?: (item: any) => React.ReactNode;
	onAdd?: () => void;
	onItemEdit?: (item) => void;
}

export const ListBox : React.FC<ListBoxProps> = (props) => {
	return (
		<Box 
			background={'neutral-1'}
			flex
			elevation="small"
			pad="xsmall" 
			round="xsmall">
			<Box
				align="center"
				justify={props.onAdd ? 'between' : 'start'}
				direction="row">
				<Text>{props.label}</Text>
				{props.onAdd && <Button style={{padding: 6, borderRadius: 3}} hoverIndicator onClick={props.onAdd} plain icon={<Add  />} />}
			</Box>
			<List data={props.data}>
				{(datum) => (
					<Box
						align="center"
						direction="row">
						<Box flex>
							{props.renderItem(datum)}
						</Box>
						{props.onItemEdit && <Button style={{padding: 6, borderRadius: 3}} hoverIndicator onClick={() => props.onItemEdit(datum)} plain icon={<MoreVert />} />}
					</Box>
				)}
			</List>
		</Box>
	)
}