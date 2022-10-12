import { Box, Text, Spinner } from 'grommet'
import React from 'react'

export const LoadingIndicator = () => (
    <Box 
      style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
        align='center'
        justify='center'
        flex>
        <Box style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6, background: "#dfdfdf"}} />
       
            <Spinner size='medium' />
            <Text>Loading...</Text>
    </Box>
)