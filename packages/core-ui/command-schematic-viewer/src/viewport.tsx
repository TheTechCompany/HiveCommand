import React from 'react';
import { useReactFlow } from 'reactflow';

export const ViewportLogger = () => {
    const {  getViewport } = useReactFlow();

    console.log(getViewport())

    return null;
}