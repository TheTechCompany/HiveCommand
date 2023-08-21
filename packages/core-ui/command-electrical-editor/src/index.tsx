import React, { useEffect, useState } from 'react';
import { Box, Divider, List, ListItem, Paper, Typography, TextField, IconButton } from '@mui/material';
import { Canvas } from './canvas';
import { useRemoteComponents } from '@hive-command/remote-components'
import { ElectricalEditorProvider } from './context'
import { ReactFlowProvider } from 'reactflow';
import { PagesPane } from './panes/pages';
import { SymbolsPane } from './panes/symbols';
import { Create, CheckBoxOutlineBlank, HighlightAlt, FormatColorText } from '@mui/icons-material';

export interface ECADPage {
    id: string;
    name: string;
    nodes?: any[];
    edges?: any[];
}

export interface ECadEditorProps {
    pages: ECADPage[]
    
    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any, log?: string) => void;
    onUpdatePageOrder?: (oldIx: number, newIx: number) => void;
}

export const Tools = [
    {
        id: 'text',
        icon: <FormatColorText />
    },
    {
        id: 'box',
        icon: <CheckBoxOutlineBlank />
    },
    {
        id: 'boxOutline',
        icon: <HighlightAlt />
    },
    {
        id: 'wire',
        icon: <Create />
    }

]


export const ECadEditor : React.FC<ECadEditorProps> = (props) => {

    const [ selectedPage, setSelectedPage ] = useState<any>(null);

    const [ pages, setPages ] = useState<ECADPage[]>(props.pages || [])

    const [items, setItems] = useState<any[]>([]);

    const [ draftWire, setDraftWire ] = useState<any>(null);

    const [ selectedSymbol, setSelectedSymbol ] = useState<any>(null);
    const [ symbolRotation, setSymbolRotation ] = useState(0);

    const [ tools, setTools ] = useState<any[]>([]);

    const [ activeTool, setActiveTool ] = useState<any | null>(null);

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
        <ReactFlowProvider>

        <ElectricalEditorProvider
            value={{
                pages,
                page: pages?.find((a) => a.id == selectedPage),
                selectedPage,
                onUpdatePage: props.onUpdatePage,
                onReorderPage: props.onUpdatePageOrder,
                elements: items,
                draftWire,
                setDraftWire,

                symbolRotation,
                selectedSymbol,
                setSelectedSymbol: (symbol: any) => {
                    setActiveTool('symbol')
                    setSelectedSymbol(symbol);
                }
            }}
        >
                <Paper
                  
                    sx={{ flex: 1, display: 'flex', height: '100vh' }}>
                    <PagesPane
                        onCreatePage={props.onCreatePage}
                        onSelectPage={(page: any) => setSelectedPage(page.id)}
                        />

                    <Box                    
                        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{display: 'flex', justifyContent: 'flex-end'}}>
                            {Tools.map((tool) => (
                                <IconButton 
                                sx={{ borderRadius: '5px', marginRight: '3px', bgcolor: activeTool == tool.id ? 'secondary.main' : null}}
                                onClick={() => {
                                    setActiveTool(activeTool != tool.id ? tool.id : null)
                                }}>
                                    {tool.icon}
                                </IconButton>
                            ))}
                        
                        </Paper>
                        <Canvas 
                            activeTool={activeTool}
                            selectedSymbol={selectedSymbol}
                            symbolRotation={symbolRotation}
                            />
                    </Box>
                    
                    <SymbolsPane />
                </Paper>
        </ElectricalEditorProvider>
        </ReactFlowProvider>

    )
}