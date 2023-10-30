import React from "react";
import { Severity } from "./severity";
import { Outlet, Route, Routes } from "react-router-dom";
import { SeverityEscalation } from "./editors/severity-escalation";

export const AlarmSubitems = (props: any) => {
    return <Routes>
            <Route path="" element={<Outlet />}>
                <Route path="" element={<Severity {...props} />} />
                <Route path=":id" element={<SeverityEscalation />} />
            </Route>
        </Routes>
}