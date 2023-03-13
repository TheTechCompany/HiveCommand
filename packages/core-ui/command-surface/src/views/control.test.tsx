import React, { useEffect, useState } from 'react';
import {render} from '@testing-library/react'
import { ControlView } from './control'
import { DeviceControlProvider } from '../context';
import { Box, Typography } from '@mui/material';
import { act } from 'react-dom/test-utils';

describe('Control View', () => {

    it('infoTarget shows state.item', async () => {
        const { container } = render(
            <DeviceControlProvider
                value={{
                    activeProgram: {
                        tags: [{
                            id: '1',
                            name: 'item',
                            type: 'Boolean'
                        }]
                    },
                    values: {
                        item: 'true',
                    },
                    infoTarget: {
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        dataFunction: (state) => {

                            return  (<div className="state-item">
                                {/* <> */}
                                   <span>{`${state.item}`}</span>
                                {/* </> */}
                            </div>)
                        }
                    }
                }}>
                <ControlView />
            </DeviceControlProvider>
        );

        // await new Promise((resolve) => setTimeout(() => resolve(true), 100));

        // console.log("INNER HTML", (container.getElementsByClassName('state-item')?.[0] as any).innerHTML)

        expect(container.getElementsByClassName('state-item')?.[0].textContent).toBe('true')
        

    })

    it('infoTarget shows state.item and updates', async () => {

        const ChangingValue = (props: any) => {
            const [ values, setValues ] = useState({item: 'true'});
            
            useEffect(() => {
                setTimeout(() => {
                    setValues({item: 'false'});
                }, 1000)
            }, [])

            return <DeviceControlProvider
            value={{
                activeProgram: {
                    tags: [{
                        id: '1',
                        name: 'item',
                        type: 'Boolean'
                    }]
                },
                values: values,
                infoTarget: {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    dataFunction: (state) => {
                        if(`${state.item}` === 'false'){
                            props.resolve?.();
                        };

                        return  (<div className="state-item">
                            {/* <> */}
                            <span>{`${state.item}`}</span>
                            {/* </> */}
                        </div>)
                    }
                }
            }}>
            <ControlView />
        </DeviceControlProvider>
        }

        // let container;
        // act(async () => {
            // container = await new Promise<HTMLElement>((resolve) => {
                const { container, findByText } = render(<ChangingValue  />);
            // })
        // })

    
        

        // await new Promise((resolve) => setTimeout(() => resolve(true), 100));

        // console.log("INNER HTML", (container.getElementsByClassName('state-item')?.[0] as any).innerHTML)

        // const elem = 
        expect((await findByText('false')).textContent).toBe('false')
        

    })
})