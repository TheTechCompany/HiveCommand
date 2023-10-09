import React from 'react';
import { Box } from '@mui/material'

export const InfoFooter = (props: {info: any}) => {
    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Box sx={{flex: 1}}>
                <Box sx={{border: '1px solid black', padding: '3px 6px 3px 6px'}}>{props.info?.project}</Box>
                <Box  sx={{border: '1px solid black', padding: '3px 6px 3px 6px'}}>v{props.info?.version} - {props.info?.versionDate}</Box>
            </Box>
            <Box sx={{flex: 1}}>
                <Box sx={{border: '1px solid black', padding: '3px 6px 3px 6px'}}>{props.info?.pageTitle}</Box>
                <Box sx={{border: '1px solid black', padding: '3px 6px 3px 6px', fontSize: '12px'}}>Page: {props.info?.page}</Box>
            </Box>
        </Box>
    )
}