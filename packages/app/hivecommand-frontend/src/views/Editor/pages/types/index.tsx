import React, { useEffect, useMemo, useState } from 'react';
import { Close } from '@mui/icons-material'
import { Autocomplete, Box, Button, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import { useCreateTypeField, useDeleteTypeField, useUpdateTypeField } from './api';
import { useCommandEditor } from '../../context';
import { debounce } from 'lodash'
import { DataTypes } from '@hive-command/scripting';
import { Route, Routes, useLocation, useMatch, useNavigate, useParams, useResolvedPath } from 'react-router-dom'
import { Alarms, CrossReference, Properties } from './views';

export const TypeEditor = (props: any) => {

    const { activeId } = useParams()

    const navigate = useNavigate();
    const items = ['', 'cross-reference', 'alarms'].map((x) => {
        return {
            match: useMatch(useResolvedPath(x).pathname),
            x
        }
    })

    const { types } = props;

    const activeType = types?.find((a) => a.id === activeId);

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Paper sx={{bgcolor: 'secondary.main', flexDirection: 'column', color: 'white'}}>
                <Box sx={{padding: '6px'}}>
                    <Typography>{activeType.name}</Typography>
                </Box>
                <Box>
                    <Tabs 
                        value={items.find((a) => a.match)?.x} 
                        onChange={(e, value) => {
                            navigate(value)
                        }}>
                        <Tab value={''} label="Properties" />
                        <Tab value={'alarms'} label="Alarms" />
                        <Tab value={'cross-reference'} label="Cross reference" />
                    </Tabs>
                </Box>
            </Paper>
            <Routes>
                <Route path="" element={<Properties active={activeId} types={types} />} />
                <Route path="cross-reference" element={<CrossReference active={activeId} types={types} />} />
                <Route path="alarms" element={<Alarms />} />
            </Routes>
  
        </Box>
    )
}