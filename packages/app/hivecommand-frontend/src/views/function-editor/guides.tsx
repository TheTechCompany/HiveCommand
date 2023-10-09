import React from 'react';
import { useReactFlow, useStore, useViewport } from 'reactflow';

export const LayoutGuides = (props: any) => {

    const transform = useStore((store) => store.transform);

    return (
        <div>
        {props?.activeGuides?.x?.map((guide: any) => (
            <div style={{position: 'absolute', left: (transform[0] + guide) * transform[2], top: 0, height: '100%', width: '1px', background: 'black'}} />
        ))}

        {props?.activeGuides?.y?.map((guide: any) => (
            <div style={{position: 'absolute', left: 0, top: (transform[1] + guide) * transform[2], width: '100%', height: '1px', background: 'black'}} />
        ))}
        </div>
    )
}