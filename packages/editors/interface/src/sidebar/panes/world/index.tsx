import { Box, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import { useInterfaceEditor } from "../../../context";
import React from "react";

export const WorldPane = () => {

    const { grid, onChangeGrid } = useInterfaceEditor();

    return (
        <Box sx={{display: 'flex', flexDirection: "column", flex: 1}}>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography sx={{marginBottom: '6px'}}>Grid size</Typography>
                <Box sx={{display: 'flex'}}>
                    <TextField value={grid?.[0]} onChange={(e) => onChangeGrid?.([e.target.value ? parseInt(e.target.value) : undefined, grid?.[1], grid?.[2] || false])} label={"X"} size="small"/>
                    <TextField value={grid?.[1]} onChange={(e) => onChangeGrid?.([grid?.[0], e.target.value ? parseInt(e.target.value) : undefined, grid?.[2] || false])} label={"Y"} size="small"/>
                </Box>
                <FormControlLabel control={
                    <Checkbox checked={grid?.[2]} onChange={(e) => onChangeGrid?.([grid?.[0], grid?.[1], e.target.checked])} />
                } label="Snap to grid" />

            </Box>
        </Box>
    )
}