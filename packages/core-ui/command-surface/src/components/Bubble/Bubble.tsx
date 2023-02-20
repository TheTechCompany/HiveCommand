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

export const Bubble : React.FC<BubbleProps> = (props) => {
	const [elem, {width, height}] = useResizeAware()

	return (
		<Box 
			onMouseDown={(e) => e.stopPropagation()}
			sx={{
				borderRadius: '6px',
				height: '195px',
				width: '260px',
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
