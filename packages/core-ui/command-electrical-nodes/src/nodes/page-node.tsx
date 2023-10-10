import React from 'react';
import { Paper, Box, Table, TableBody, TableRow, TableCell } from '@mui/material'
import { Handle, NodeProps, Position } from 'reactflow';

export const PageNode = (props: NodeProps) => {

    const ratio = 210 / 297

    return (
        <Paper style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            width: props.data?.width || 1080, 
            height: props.data?.height || 1080*ratio,
            opacity: 0.4
        }}>
            {/* <Handle type="target" id={"canvas-target"} position={Position.Left}  />
            <Handle type="source" id={"canvas-source"} position={Position.Left}  /> */}
        <Box sx={{flex: 1, display: 'flex'}}>

        </Box>
        <Table sx={{
            tableLayout: 'fixed',
            border: '1px solid black',
            '& td': {
                border: '1px solid black',
                padding: '3px',
                width: '50%'
            }
            // borderCollapse: 'collapse',
            // border: '1px solid black',
            // width: '100%',
        }}>
            <TableBody>
                <TableRow>
                    <TableCell>{props.data?.project?.name}{/*name*/}</TableCell>
                    <TableCell>{props.data?.page?.name}{/*pageTitle*/}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{props.data?.project?.version}{/*version*/}</TableCell>
                    <TableCell>{props.data?.page?.number}{/*page number*/}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
        </Paper>
    )
}