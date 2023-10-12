import React from 'react';
import { Box, Button, IconButton, MenuItem, Typography } from '@mui/material';
import { Select, Option } from '@mui/base'
import { VersionSelector } from './version-selector';
import { StyledOption } from './version-selector/components';

export interface EditorToolbarProps {
    title: string;
    activeVersion?: string;
    versions?: { id: string, rank: number }[]

    tools?: {
        id: string,
        icon: any,
        children?: any[];
    }[]
    activeTool?: { type: string, data?: any } | null;

    onToolChange?: (type: string | null, data?: any) => void;

    onExport?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = (props) => {

    return (
        <Box sx={{
            height: '48px',
            display: 'flex',
            justifyContent: 'space-between',
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '4px'
            }}>
                {/* <Box sx={{ width: '48px', height: '48px', '&:hover': { background: "#444444a4" } }}>
                    File
                </Box> */}
                <Box>
                    {props.tools?.map((tool) => (
                        <IconButton
                            sx={{
                                borderRadius: '5px',
                                marginRight: '3px',
                                backgroundColor: props.activeTool?.type == tool.id ? 'rgba(0,0,0,0.1)' : null
                            }}
                            onClick={() => {
                                props.onToolChange?.(props.activeTool?.type == tool.id ? null : tool.id)
                                // setSelectedSymbol(null);
                                // setActiveTool(activeTool != tool.id ? tool.id : null)
                            }}>
                            {tool.icon}
                        </IconButton>
                    ))}
                    {/* Tools */}
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Title */}
                <Typography>{props.title}</Typography>
                <VersionSelector
                    style={{
                        marginLeft: '6px'
                    }}
                    onChange={(event) => {
                        console.log(event)
                    }}
                    value={props.activeVersion || 'draft'}>
                        <StyledOption value={'draft'}>Draft</StyledOption>
                    {props.versions?.sort((a, b) => a.rank - b.rank)?.map((version) => (
                        <StyledOption value={version.id}>v{version.rank}</StyledOption>
                    ))}
                </VersionSelector>
            </Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                paddingRight: '4px'
            }}>
                {/* Share profile e.g.*/}
                <Button 
                    onClick={props.onExport}
                    variant='contained' 
                    size="small" 
                    color='primary'>Export</Button>
            </Box>
        </Box>
    )
}