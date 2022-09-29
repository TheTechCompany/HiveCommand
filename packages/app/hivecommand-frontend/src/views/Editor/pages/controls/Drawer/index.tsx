import { Box } from "@mui/material";
import React from "react";
import { ActionMenu } from "./actions";
import { ConfigMenu } from "./config";
import { NodeMenu } from "./nodes";

export interface HMIDrawerProps {
    menu?: string;
    nodes?: any[];
}

export const HMIDrawer : React.FC<HMIDrawerProps> = (props) => {

    console.log({nodes: props.nodes})
    const renderMenu = () => {
        switch(props.menu){
            case 'actions':
                return (
                   <ActionMenu />
                );
            case 'nodes':
                return (
                    <NodeMenu nodes={props.nodes} />
                )
            case 'config':
                // let item = selected.key == 'node' ? nodes.find((a) => a.id == selected.id) : undefined
                return (
                    <ConfigMenu nodes={props.nodes}/>
                 )
        }
       
    }
    
    return (
        <Box
            sx={{
                overflow: 'auto',
                height: '100%',
                width: '175px'
            }}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}>
            {renderMenu()}
        </Box>
    )
}