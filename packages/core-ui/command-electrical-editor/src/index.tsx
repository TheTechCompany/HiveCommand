import React, { useEffect, useState } from 'react';
import { Box, Divider, List, ListItem, Paper, Typography, TextField } from '@mui/material';
import { Canvas } from './canvas';
import { useRemoteComponents } from '@hive-command/remote-components'
import { ElectricalEditorProvider } from './context'
import { ReactFlowProvider } from 'reactflow';
import { PagesPane } from './panes/pages';
import { SymbolsPane } from './panes/symbols';

export interface ECADPage {
    id: string;
    name: string;
    nodes?: any[];
    edges?: any[];
}

export interface ECadEditorProps {
    pages: ECADPage[]
    
    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
}

export const ECadEditor : React.FC<ECadEditorProps> = (props) => {

    const [ selectedPage, setSelectedPage ] = useState<any>(null);

    const [ pages, setPages ] = useState<ECADPage[]>(props.pages || [])

    const [ nodes, setNodes ] = useState<any[]>([]);

    const [cursorActive, setCursorActive] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null)

    const [items, setItems] = useState<any[]>([]);

    const [ selectedSymbol, setSelectedSymbol ] = useState<any>(null);
    const [ symbolRotation, setSymbolRotation ] = useState(0);

    const { getPack } = useRemoteComponents()

    useEffect(() => {
       setPages(props.pages);
    }, [props.pages])

    useEffect(() => {
        getPack('github-01', 'https://raw.githubusercontent.com/TheTechCompany/hive-command-electrical-symbols/main/dist/components/', 'index.js').then((pack) => {
            setItems((pack || []))
            console.log({ pack })
        })

    }, [])


    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if(e.key == 'Tab'){
                e.preventDefault();
                e.stopPropagation();

                setSymbolRotation((symbolRotation) => ((symbolRotation || 0) + 90) % 360);
            }

            if(e.key == 'Escape'){
                e.preventDefault();
                e.stopPropagation();

                setSelectedSymbol(null);
                setSymbolRotation(0);
            }
        }
        
        window.addEventListener('keydown', listener);

        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [])


    return (
        <ElectricalEditorProvider
            value={{
                pages,
                selectedPage,
                onUpdatePage: props.onUpdatePage,
                elements: items,
                cursorActive,
                cursorPosition,
                symbolRotation,
                selectedSymbol,
                setSelectedSymbol
            }}
        >
            <ReactFlowProvider>
                <Paper
                  
                    sx={{ flex: 1, display: 'flex', height: '100vh' }}>
                    <PagesPane
                        onCreatePage={props.onCreatePage}
                        onSelectPage={(page: any) => setSelectedPage(page.id)}
                        />

                    <Box
                        onMouseEnter={() => { 
                            // setCursorActive(true)
                         }}
                        onMouseLeave={() => {
                            // setCursorActive(false)
                            // setCursorPosition(null)
                        }}
                        onMouseMove={(e) => {
                            // setCursorPosition({ x: e.clientX, y: e.clientY })
                        }}
                    
                        sx={{ flex: 1, display: 'flex' }}>
                        <Canvas />
                    </Box>
                    
                    <SymbolsPane />
                </Paper>
            </ReactFlowProvider>
        </ElectricalEditorProvider>
    )
}