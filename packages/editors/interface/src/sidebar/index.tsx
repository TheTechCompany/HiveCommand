import { Box, IconButton, Collapse, Paper } from "@mui/material";
import React, { useState } from "react";
import { GridView as Nodes, Assignment, Public } from '@mui/icons-material';
import Settings from '../icons/Settings';
import { ElementPane } from "./panes/elements";
import { useInterfaceEditor } from "../context";
import { TransformPane } from "./panes/transform";
import { ConfigurationPane } from "./panes/configuration";
import { Node } from 'reactflow';
import { merge } from 'lodash';
import { WorldPane } from "./panes/world";

export interface SidebarProps {

    onNodeUpdate?: (node: Node) => void;
}


export const Sidebar: React.FC<SidebarProps> = (props) => {

    const { nodes, selected } = useInterfaceEditor()

    const onNodeUpdate = (update: any) => {
        let activeNode = Object.assign({}, nodes?.find((a) => a.id == selected?.nodes?.[0]?.id) );

        activeNode = merge({}, activeNode, update)

        if(activeNode)
        props.onNodeUpdate?.(activeNode)
    }

    const menuOptions = [
        {
            icon: <Nodes />,
            path: 'nodes',
            pane: <ElementPane  />
        },
        {
            icon: <Assignment style={{ fill: 'white' }} width="24px" />,
            path: 'template',
            pane: <ConfigurationPane
                    onNodeUpdate={onNodeUpdate}
                />
        },
        {
            icon: <Settings style={{ fill: 'white' }} width="24px" />,
            path: 'transform',
            pane: <TransformPane onNodeUpdate={onNodeUpdate} />
        },
        {
            icon: <Public />,
            path: 'world',
            pane: <WorldPane />
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
                    maxWidth: '242px',
                    flexDirection: 'column',
                    '& .MuiCollapse-wrapperInner': {
                        display: 'flex'
                    }
                }}>
                <Paper sx={{minWidth: '230px', display: 'flex', paddingTop: '6px', paddingLeft: '6px', paddingRight: '6px'}}>
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
