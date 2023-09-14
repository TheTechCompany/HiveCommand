import React from 'react';

export const InfoFooter = (props: {info: any}) => {
    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Box sx={{flex: 1}}>
                <Box sx={{border: '1px solid black'}}>{props.info?.project}</Box>

            </Box>
            <Box sx={{flex: 1}}>
                <Box sx={{border: '1px solid black'}}>Page: {props.info?.page}</Box>
            </Box>
        </Box>
    )
}