import { BumpInput } from "@hexhive/ui";
import { Autocomplete, Box, Checkbox, FormControlLabel, IconButton, InputAdornment, Select, TextField, Typography } from "@mui/material";
import { TableView as Aggregate, TripOrigin, RotateLeft, RotateRight, Remove as Subtract, Add, Javascript } from '@mui/icons-material';
import React, { useContext, useEffect, useMemo, useState } from "react";

import { useHMIContext } from "../context";

import { Edge, Node, useEdges, useNodes } from 'reactflow';
import { NodeConfig } from "./node-config";
import { EdgeConfig } from "./edge-config";
// import { HMICanvasContext } from "../context";

export interface ConfigMenuProps {
    nodes?: any[]
}

export const ConfigMenu : React.FC<ConfigMenuProps> = (props) => {


    const [ aggregate, setAggregate ] = useState<any>()
    const [ modalOpen, openModal ] = useState<boolean>(false);

    const { programId, interfaces, selected } = useHMIContext();

    const nodes = useNodes<Node>()
    const edges = useEdges<Edge>();

    const selected_nodes = nodes.filter((a) => (selected?.nodes || []).findIndex((b) => b.id == a.id) > -1) || [];
    const selected_edges = edges.filter((a) => (selected?.edges || []).findIndex((b) => b.id == a.id) > -1) || [];

    const item = selected_nodes?.[0] || selected_edges?.[0] //nodes?.find((a) => a.id == selected.id);

    // console.log({item});

    return (

        <Box
            sx={{padding: '6px'}}
            >
    
            
            <Box sx={{display :'flex', padding: '6px'}}>
                <Typography>Config</Typography>
              
            </Box>
          
            {item && (item as Node)?.position != null ? (
                <NodeConfig item={item as Node} />
            ) : item ? (
                <EdgeConfig />
            ) : null}

      
        </Box>

    )
}