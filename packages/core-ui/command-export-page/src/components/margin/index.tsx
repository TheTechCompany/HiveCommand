import { Typography } from '@mui/material';
import React from 'react';

export interface MarginProps {
    letters?: boolean;
    divisions?: number;
    direction?: any;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const Margins : React.FC<MarginProps> = (props) => {
    const items = Array.from(new Array(props.divisions)).map((x, ix) => props.letters ? LETTERS[ix % LETTERS.length] : ix + 1)

    return <div style={{
        display: 'flex', 
        flexDirection: props.direction,
        borderRight: props.direction == 'column' ? '1px solid black' : undefined,
        borderLeft: props.direction == 'column' ? '1px solid black' : undefined,
        borderTop: props.direction == 'row' ? '1px solid black' : undefined,
        borderBottom: props.direction == 'row' ? '1px solid black' : undefined

    }}>
             <div style={{width: '19px', height: '19px'}}></div>

        <div style={{display: 'flex', flex: 1, alignItems: 'center' , justifyContent:  'space-between', flexDirection: props.direction}}>
            {items.map((x, ix) => 
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: props.direction == 'row' && ix < items.length - 1 ? '1px solid black' : undefined,
                    borderBottom: props.direction == 'column' && ix < items.length - 1 ? '1px solid black' : undefined
                }}>
                    <Typography>{`${x}`}</Typography>
                </div>)}

        </div>
        <div style={{width: '19px', height: '19px'}}></div>

    </div>
   
}