import { AlarmList } from './list';
import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { AlarmConditions } from './editors/alarm-conditions';

export const AlarmRoot = (props: any) => {
    return (
        <Routes>
            <Route path="" element={<Outlet />}>
                <Route path="" element={<AlarmList {...props} />} />
                <Route path=":id/conditions" element={<AlarmConditions />} />
            </Route>
        </Routes>
    )
}