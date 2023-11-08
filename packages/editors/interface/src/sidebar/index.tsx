import { Box, IconButton, Collapse, Paper } from "@mui/material";
import React, { useState } from "react";
import { GridView as Nodes, Assignment } from '@mui/icons-material';
import Settings from '../icons/Settings';
import { ElementPane } from "./panes/elements";
import { useInterfaceEditor } from "../context";
import { TransformPane } from "./panes/transform";
import { ConfigurationPane } from "./panes/configuration";
import { Node } from 'reactflow';


export interface SidebarProps {
    selectedNode?: Node;
}


export const Sidebar: React.FC<SidebarProps> = (props) => {


    const menuOptions = [
        {
            icon: <Nodes />,
            path: 'nodes',
            pane: <ElementPane  />
        },
        {
            icon: <Assignment style={{ fill: 'white' }} width="24px" />,
            path: 'template',
            pane: <ConfigurationPane nodes={[]} />
        },
        {
            icon: <Settings style={{ fill: 'white' }} width="24px" />,
            path: 'transform',
            pane: <TransformPane selectedNode={props.selectedNode} />
        }
    ];

    const [menuOpen, openMenu] = useState<string | undefined>(undefined);

    const changeMenu = (view: string) => {
        openMenu(view == menuOpen ? undefined : view);
    };


    return (
        <>
            <Collapse
                in={Boolean(menuOpen)}
                orientation="horizontal"
                sx={{
                    display: 'flex',
                    height: '100%',
                    width: '250px',
                    flexDirection: 'column',
                    '& .MuiCollapse-wrapperInner': {
                        display: 'flex'
                    }
                }}>
                <Paper sx={{display: 'flex', paddingLeft: '6px', paddingRight: '6px'}}>
                    {menuOptions.find((a) => a.path == menuOpen)?.pane}
                </Paper>
            </Collapse>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'secondary.main',
                color: 'white'
            }}>
                {menuOptions.map((option) => (
                    <div style={{ background: menuOpen == option.path ? '#dfdfdfdf' : undefined }}>
                        <IconButton
                            sx={{ color: 'white', fontSize: '12px' }}
                            onClick={() => changeMenu(option.path)}>
                            {option.icon}
                        </IconButton>
                    </div>
                ))}


            </Box>
        </>
    );
};
