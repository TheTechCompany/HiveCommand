import { Box, List, Typography } from "@mui/material";
import { useInterfaceEditor } from "../../../context";
import React from "react";

export interface ElementPaneProps {

}

export const ElementPane : React.FC<ElementPaneProps> = (props) => {
    const { packs, changeTool, activeTool } = useInterfaceEditor();

    return (
        <Box sx={{display: 'flex', overflow: 'auto',}}>
            <List style={{height: 0, display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
            {packs?.map((pack) => 
                pack.pack?.map((element) => (
                    <Box 
                    onClick={() => changeTool?.(activeTool?.pack == pack.id && element.name == activeTool?.name ? null : {pack: pack.id, name: element.name})}
                    sx={{
                        flex: 1,
                        minWidth: '80px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexDirection: 'column', 
                        minHeight: '80px',
                        border: '1px solid gray',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: activeTool?.pack == pack.id && activeTool.name == element.name ? '#dfdfdf' : undefined,
                        '&:hover': {
                            background: '#dfdfdfda'
                        }
                    }}>
                        <Box sx={{
                            width: '50px', 
                            height: '50px', 
                            pointerEvents: 'none',
                            '& > *': {width: '100%', height: '100%'}
                        }}>
                            {element.component?.({})}
                        </Box>
                        <Typography sx={{fontSize: '12px', textAlign: 'center'}}>
                            {element.name}
                        </Typography>
                    </Box>
                ))
            )}
            </List>

        </Box>
    )
}