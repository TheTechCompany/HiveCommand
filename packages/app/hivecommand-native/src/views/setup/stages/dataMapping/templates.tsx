import { Box, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Add } from '@mui/icons-material'
import React, { useContext, useState } from 'react';
import { SetupContext } from '../../context';

export const TemplateView = () => {

    const [ templates, setTemplates ] = useState<any[]>([]);

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    const controlLayout = globalState?.controlLayout;
    
    return (
        <Box sx={{flex: 1}}>
            <Box sx={{display: 'flex', justifyContent: "flex-end"}}>
                <IconButton onClick={() => setTemplates(templates.concat([{name: ''}]))}>
                    <Add />
                </IconButton>
            </Box>
            <Box>
                {templates.map((template, ix) => (
                    <Box key={template.id}>
                        <Box sx={{display: 'flex'}}>
                            <TextField
                                size="small"
                                fullWidth
                                value={template.name} 
                                onChange={(e) => {
                                    setTemplates((t) => {
                                        let newT = {...t[ix], name: e.target.value} //Object.assign({}, t[ix])
                                        // newT.name = e.target.value;
                                        let newArr = t.slice();
                                        newArr[ix] = newT;
                                        return newArr;
                                    })
                                }} />
                            {/* <FormControl fullWidth>
                                <InputLabel>Template Type</InputLabel>
                                <Select>
                                    {controlLayout?.types?.map((type) => (
                                        <MenuItem value={type.id}>{type.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}

                        </Box>
                        <Divider />
                    </Box>
                ))}
            </Box>
        </Box>
    )
}