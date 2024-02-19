jest.mock("monaco-editor");


import React, { useMemo, useState } from "react";
import { InterfaceEditor } from '../src'
import { fireEvent, getByRole, render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from "reactflow";
import preview from 'jest-preview';
import { readFileSync } from 'fs';
import { Box } from '@mui/material';
import path from 'path';



window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe('Selection', () => {
    it('Can select item', async () => {

        let selected : any = {edges: [], nodes: []};
        const {container} = render(<TestEnvironment selected={selected} onSelectionChange={(selection: any) => {
            selected =  selection;
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const elems = Array.from(document.getElementsByClassName('react-flow__node'))
    
        if(elems?.length > 0){
            fireEvent.click(elems?.[0])
        }

        preview.debug();

        expect(selected.nodes?.length).toBeGreaterThan(0);

    })

    it('Can deselect item by clicking pane', async () => {

        let selected : any = {edges: [], nodes: []};
        const {container} = render(<TestEnvironment selected={selected} onSelectionChange={(selection: any) => {
            selected =  selection;
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const nodeElems = Array.from(document.getElementsByClassName('react-flow__node'))


        const elems = Array.from(document.getElementsByClassName('react-flow__pane'))
    
        if(nodeElems?.length > 0 && elems?.length > 0){
            fireEvent?.click(nodeElems?.[0]);

            fireEvent.click(elems?.[0])
        }

        preview.debug();

        expect(selected.nodes?.length).toBe(0);

    })

    it('Can select multiple items', async () => {

        let selected = 0;
        const {container} = render(<TestEnvironment count={3} selected={selected} onSelectionChange={(selection: any) => {
            selected++;
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const elems = Array.from(document.getElementsByClassName('react-flow__node'))
    
        if(elems?.length > 0){
            // fireEvent.
            fireEvent.click(elems?.[0])
            fireEvent.click(elems?.[1], {ctrlKey: true})
            fireEvent.click(elems?.[2], {metaKey: true})
        }

        preview.debug();

        expect(selected).toBe(3);

    })


    it('Can deselect items from multiple item selection', async () => {

        let selected : any = {edges: [], nodes: []};

        const {container} = render(<TestEnvironment count={3} selected={selected} onSelectionChange={(selection: any) => {
            selected = selection;
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const elems = Array.from(document.getElementsByClassName('react-flow__node'))
    
        if(elems?.length > 0){
            // fireEvent.
            fireEvent.click(elems?.[0])
            fireEvent.click(elems?.[1], {ctrlKey: true})
            fireEvent.click(elems?.[1], {ctrlKey: true})
        }

        preview.debug();

        expect(selected?.nodes?.length).toBe(1);

    })



    it('Selects one after selecting multiple', async () => {

        let selected : any = {edges: [], nodes: []};

        const {container} = render(<TestEnvironment count={3} selected={selected} onSelectionChange={(selection: any) => {
            selected = selection;
            console.log({selected})
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const elems = Array.from(document.getElementsByClassName('react-flow__node'))
    
        if(elems?.length > 0){
            // fireEvent.
            fireEvent.click(elems?.[0], {ctrlKey: true})
            fireEvent.click(elems?.[1], {ctrlKey: true})

            fireEvent.click(elems?.[0])
        }

        preview.debug();

        expect(selected?.nodes?.length).toBe(1);

    })

    it('Can clear selection after delete', async () => {

        let selected : any = {edges: [], nodes: []};

        const {container} = render(<TestEnvironment count={3} selected={selected} onSelectionChange={(selection: any) => {
            selected = selection;
            console.log({selected})
        }} />);

        const stylesheetFile = readFileSync(require.resolve('reactflow/dist/style.css'), 'utf-8');

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.innerHTML = stylesheetFile;

        container.append(styleTag)
      
        const user = userEvent.setup();

        const elems = Array.from(document.getElementsByClassName('react-flow__node'))
    
        if(elems?.length > 0){
            // fireEvent.
            fireEvent.click(elems?.[0], {ctrlKey: true})
            fireEvent.click(elems?.[1], {ctrlKey: true})

            
            fireEvent.keyDown(elems?.[0], {key: 'Backspace', code: "Backspace"})
        }

        preview.debug();

        expect(selected?.nodes?.length).toBe(0);

    })
})


export interface TestEnvironmentProps {
    selected?: any;
    onSelectionChange?: any;

    count?: number;
}
export const TestEnvironment : React.FC<TestEnvironmentProps> = (props) => {

    const nodes = useMemo(() => {
        let arr : any[] = [];
        for(var i = 0; i < (props.count || 1); i++){
            arr.push({
                id: `${i}`,
                data: {label: "ASDFG"},
                position: {x: 50 * i, y: 50}
            })
        }
        return arr;
    }, [props.count]);

    return (
        <Box sx={{flex: 1, display: 'flex', width: '100vw', height: '100vh'}}>
            <ReactFlowProvider>
                    <InterfaceEditor 
                        tags={[]}
                        types={[]}
                        templates={[]}
                        packs={[]}
                        flowProps={{
                            nodesDraggable: false
                        }}
                        selected={props.selected}
                        onSelectionChange={props.onSelectionChange}
                        onNodeDelete={(node) => {
                        }}
                        nodes={nodes} 
                        edges={[]} />
            </ReactFlowProvider>
        </Box>
    )
}