import { Box, Divider, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Block, BlockTray } from '@hexhive/ui';
import styled from 'styled-components'
import { Node } from './node';

export interface NodeDropdownProps {
    title?: string;
    items: Block[];
    className?: string;
}

export const BaseNodeDropdown: React.FC<NodeDropdownProps> = (props) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            {props.items?.map((block) => (
                <Node id={`${block.extras?.pack}:${block.extras?.name}`}>
                    <Box
                        sx={{
                            cursor: 'pointer',
                            borderRadius: '3px',
                            padding: '4px',
                            bgcolor: 'secondary.main',
                            color: 'white',
                            alignItems: 'center',
                            justifyContent: block.extras?.dimensions ? 'center' : 'start',
                            display: 'flex'
                        }}>


                        {/* <Box 
         style={{cursor: 'pointer'}}
         background="neutral-4" 
         round="xsmall" 
         pad={{horizontal: "xsmall"}}>
         {node.icon} 
     </Box>
 ) */}
                        <div >
                            {React.cloneElement(block.icon, { style: { stroke: 'gray', width: `${block.extras.width}px`, height: `${block.extras.height}px` } })}
                        </div>
                        <Box
                            style={
                                block.extras?.dimensions ||
                                { marginLeft: 8 }
                            }>
                            {block.content || block?.label}
                        </Box>
                    </Box>
                </Node>
            ))}
            {/* <BlockTray 
                        groupBy="group"
                        renderHeader={(header) => (
                            <>
                                <Typography>{header}</Typography>
                                <Divider />
                            </>
                        )}
                        renderItem={(block) => (
                       )}
                        blocks={props.items as any} /> */}
        </Box>

    )
}

export const NodeDropdown = styled(BaseNodeDropdown)`
    .tray-item {
        background: #003f49;
        margin-bottom: 8px;
        cursor: pointer;
        box-shadow: 0px 4px 8px -4px black;
    }
`  