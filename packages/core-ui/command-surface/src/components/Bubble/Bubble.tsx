import React from 'react'
import { Box } from '@mui/material';
import styled from 'styled-components'
import { HexHiveTheme } from '@hexhive/styles';
import useResizeAware from 'react-resize-aware'

export interface BubbleProps {
  	children: React.ReactNode
	className?: string;
	style?: any;
}

export const UnstyledBubble : React.FC<BubbleProps> = (props) => {
	const [elem, {width, height}] = useResizeAware()

	return (
		<Box 
			onMouseDown={(e) => e.stopPropagation()}
			sx={{
				borderRadius: '6px',
				minHeight: '121px',
				minWidth: '200px',
				bgcolor: 'primary.light',
				display: 'flex',
				flexDirection: 'column'
			}}
			
			style={{...props.style, top: props.style.top - (height || 0 / 2) }}
			className={props.className}>
			{elem}
			{props.children}
		</Box>
	)
}

export const Bubble = styled(UnstyledBubble)`
	&:before{
		content: "";
		position: absolute;
		right: 100%;
		top: 50%;
		bottom: 50%;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-right: 12px solid ${HexHiveTheme.palette.secondary.light};
		border-bottom: 6px solid transparent;
	}
`