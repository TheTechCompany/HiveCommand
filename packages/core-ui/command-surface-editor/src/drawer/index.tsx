import { Box } from "@mui/material";
import React from "react";
import { ConfigMenu } from "./config";
import { NodeMenu } from "./nodes";
import { TemplateMenu } from "./template";

export interface HMIDrawerProps {
    menu?: string;
    
    nodes?: any[];
}

export const HMIDrawer : React.FC<HMIDrawerProps> = (props) => {

    const renderMenu = () => {
        switch(props.menu){
            case 'nodes':
                return (
                    <NodeMenu nodes={props.nodes} />
                )
            case 'config':
                // let item = selected.key == 'node' ? nodes.find((a) => a.id == selected.id) : undefined
                return (
                    <ConfigMenu nodes={props.nodes}/>
                )
            case 'template':
                return (
                    <TemplateMenu />
                )
        }
       
    }
    
    return (
        <Box
            sx={{
                overflowY: 'auto',
                height: '100%',
                width: '250px'
            }}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}>
            {renderMenu()}
        </Box>
    )
}