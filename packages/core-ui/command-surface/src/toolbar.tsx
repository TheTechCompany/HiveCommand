import React from 'react';
import { Box, IconButton, Button, Tab, Tabs } from '@mui/material'
// import { matchPath, useLocation, useMatch, useResolvedPath } from 'react-router-dom';
// const ToolbarButton = (props) => {

// 	const path = useResolvedPath(props.id);
// 	const active = useMatch(path.pathname) != null;

// 	console.log({path, active});

// 	return (
// 		<Button
// 			color={'navigation'}
// 			variant={active ? 'outlined' : undefined}
// 			onClick={props.onClick}>
// 			{props.label}
// 		</Button>
// 	)
// }

export default (props: {
	items?: {id: string, label: string, icon: any, active?: boolean}[], 
	active?: string,
	onItemClick?: (item: any) => void;
}) => {

	// const globalPath = useLocation()

	return  (
		<Box>
			{props.items?.map((item) => {
				// const path = useResolvedPath(item.id);
				return <Button
						sx={{color: 'white'}}
						onClick={() => props.onItemClick?.(item.id)}>
					{item.icon}
					{item.label}
				</Button>
			})}
		</Box>
		

	)
}
// value={path.pathname} label={item.label}
/*
<Tabs
		
			textColor='primary'
			onChange={(event, value) => {
				props.onItemClick?.(value);
			}}
			value={path.pathname}>
		
		</Tabs>
*/

/*
		<Box
			sx={{display: 'flex', flexDirection: 'row'}}
			>
			{props.items.map((item) => (
				<ToolbarButton
					id={item.id}
					label={item.label}
					onClick={() => props.onItemClick && props.onItemClick(item)}
					icon={item.icon} />
			))}
		</Box>
*/