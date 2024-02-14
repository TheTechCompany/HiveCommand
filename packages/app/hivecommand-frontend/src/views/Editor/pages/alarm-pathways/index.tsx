import { Box } from "@mui/material";
import React from "react";
import { CodeEditor } from "./code";

export const AlarmPathwayEditor = () => {
    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <CodeEditor defaultValue={`export const sendNotification = (message: string) => {}`}/>
        </Box>
    )
}