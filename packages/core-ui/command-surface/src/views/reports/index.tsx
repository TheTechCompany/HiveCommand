import { Box, Button, ButtonGroup, Divider, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { DeviceControlContext } from '../../context';
import { Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ReportList } from './list';
import { ReportFields } from './fields';

export const ReportView = () => {
    
    const { activePage } = useParams();

    const { reports } = useContext(DeviceControlContext);

    const activeReport = reports?.find((a) => a.id == activePage);

    const location = useLocation();

    console.log({location})

    const navigate = useNavigate();

    return (
        <Box sx={{flex: 1, display: 'flex', padding: '6px', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', marginBottom: '6px', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography>{activeReport?.name}</Typography>
                <ButtonGroup>
                    <Button variant={location.pathname.indexOf('fields') < 0 ? 'contained' : undefined} onClick={() => navigate('.')}>Reports</Button>
                    <Button variant={location.pathname.indexOf('fields') > -1 ? 'contained' : undefined} onClick={() => navigate('fields')}>Fields</Button>
                </ButtonGroup>
            </Box>
            <Divider />
            <Box sx={{flex: 1, display: 'flex'}}>
                <Routes>
                    <Route path="" element={<Outlet />}>
                        <Route path="" element={<ReportList />} />
                        <Route path="fields" element={<ReportFields />} />
                    </Route>
                </Routes>
            </Box>
        </Box>
    )
}