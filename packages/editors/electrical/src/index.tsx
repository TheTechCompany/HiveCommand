import React, { useEffect, useMemo, useState } from 'react';
import { EditorToolbar } from '@hive-command/editor-toolbar'
import { Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { ActiveTool, Tools, ToolMenu } from './tools';
import { PagesPane } from './panes/pages';
import { ElectricalNodesProvider, edgeTypes, nodeTypes } from "@hive-command/electrical-nodes";
import { useComponents } from './hooks/useComponents';
import { SymbolsPane } from './panes/symbols';
import { ElectricalSurface } from './components/surface';
import { ReactFlowProvider } from 'reactflow';

import 'reactflow/dist/style.css';

export interface ElectricalEditorProps {
    title: string;
    
    versions: {id: string, rank: number, createdAt: Date, createdBy: any}[]
    pages: { id: string, name: string, nodes: any[], edges: any[] }[]

    onExport?: () => void;

    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
    onDeletePage?: (page: any) => void;

    onUpdatePageOrder?: (id: string, above: any, below: any) => void;
}



export const ElectricalEditor : React.FC<ElectricalEditorProps> = (props) => {

    const selectedVersion = props.versions?.[props.versions?.length - 1];

    const [ selectedPage, setSelectedPage ] = useState<any | null>(null);

   const elements = useComponents();

   const activePage = props.pages?.find((a) => a.id == selectedPage?.id);

    const [ activeTool, setActiveTool ] = useState<ActiveTool>()

    console.log(ToolMenu, Tools)

    const tools = useMemo(() => ToolMenu(), [])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if(e.key == 'Escape'){
                setActiveTool(undefined)
            }
        }

        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [])
    return (
        <ReactFlowProvider>
            <ElectricalNodesProvider value={{elements}}>
                <Paper sx={{flex: 1, display: 'flex',  zIndex: 2, flexDirection: 'column'}}>
            
                    <EditorToolbar 
                        title={props.title} 
                        tools={tools}
                        activeTool={activeTool}
                        onToolChange={(tool, data) => {
                            setActiveTool(tool ? {type: tool, data} : undefined)
                        }}
                        versions={props.versions} 
                        activeVersion={selectedVersion?.id}
                        onExport={props.onExport}
                        />
                    <Divider />
                    <Box sx={{flex: 1, display: 'flex'}}>
                        <PagesPane
                            pages={props.pages}
                            selectedPage={selectedPage}
                            onCreatePage={props.onCreatePage}
                            onUpdatePage={props.onUpdatePage}
                            onDeletePage={props.onDeletePage}
                            onReorderPage={props.onUpdatePageOrder}
                            onSelectPage={(pageId) => {
                                setSelectedPage(pageId)
                            }} />
                        
                        <Divider orientation='vertical' />
                        <Box sx={{flex: 1, zIndex: 1, display: 'flex'}}>
                            <ElectricalSurface
                                page={activePage}
                                onUpdate={(page) => {
                                    console.log("UPDATE", page);
                                    props.onUpdatePage?.(page)
                                }}
                                clipboard={{}}
                                activeTool={activeTool}
                                />
                        </Box>
                        <Divider orientation='vertical' />
                        <SymbolsPane
                            activeTool={activeTool}
                            onSelectSymbol={(symbol) => {
                                console.log(symbol)
                                setActiveTool({type: 'symbol', data: {symbol: elements?.find((a) => a.name == symbol)}})
                            }}
                            />
                    </Box>
                </Paper>
            </ElectricalNodesProvider>
        </ReactFlowProvider>
    )
}