import React from 'react';
import { Box, Button } from 'grommet'
import { matchPath, useMatch, useResolvedPath } from 'react-router-dom';

const ToolbarButton = (props) => {

	const path = useResolvedPath(props.id);
	const active = useMatch(path.pathname) != null;

	console.log({path, active});

	return (
		<Button 
			onClick={props.onClick}
			hoverIndicator
			active={active}
			icon={props.icon} />
	)
}

export default (props: {
	items?: {id: string, icon: any}[], 
	active?: string,
	onItemClick?: (item) => void;
}) => {
	console.log({props})
	return (
		<Box
			background="accent-1"
			>
			{props.items.map((item) => (
				<ToolbarButton
					id={item.id}
					onClick={() => props.onItemClick && props.onItemClick(item)}
					icon={item.icon} />
			))}
		</Box>
	)
}