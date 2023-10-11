import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorToolbar } from '@hive-command/editor-toolbar'
import { Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { ActiveTool, Tools, ToolMenu } from './tools';
import { PagesPane } from './panes/pages';
import { ElectricalNodesProvider, edgeTypes, nodeTypes } from "@hive-command/electrical-nodes";
import { useComponents } from './hooks/useComponents';
import { SymbolsPane } from './panes/symbols';
import { ElectricalSurface } from './components/surface';
import { ReactFlowProvider, Edge, Node } from 'reactflow';
import moment from 'moment';
import 'reactflow/dist/style.css';
import { EditorCanvasSelection } from '@hive-command/editor-canvas';
import { ElectricalPage, ElectricalVersion } from './types';


export interface ElectricalEditorProps {
    title: string;
    
    versions: ElectricalVersion[]
    pages: ElectricalPage[]
    templates?: {id: string, name: string}[];

    onExport?: () => void;

    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
    onDeletePage?: (page: any) => void;


    onCreateTemplate?: (page: any) => void;
    onUpdateTemplate?: (page: any) => void;
    onDeleteTemplate?: (page: any) => void;


    onUpdatePageOrder?: (id: string, above: any, below: any) => void;
}



export const ElectricalEditor : React.FC<ElectricalEditorProps> = (props) => {

    const sortedPages = useMemo(() => props.pages?.slice()?.sort((a, b) => (a.rank || '').localeCompare(b.rank || '') ), [props.pages])

    // const selectedVersion = props.versions?.[props.versions?.length - 1];

    const [ selectedVersion, setSelectedVersion ] = useState<ElectricalVersion | null>(null)

    const [ selectedPage, setSelectedPage ] = useState<any | null>(null);

   const elements = useComponents();

   const activePage = sortedPages?.find((a) => a.id == selectedPage?.id);

   const activePageIndex = sortedPages?.findIndex((a) => a.id == selectedPage?.id);

   const activeTemplate = props.templates?.find((a) => a.id == selectedPage?.id);

    const [ activeTool, setActiveTool ] = useState<ActiveTool>()

    const [ selection, setSelection ] = useState<EditorCanvasSelection>({});

    const tools = useMemo(() => ToolMenu(), [])


    const onDelete = useCallback(() => {
        // alert("Deleting " + selection?.length)
        props.onUpdatePage?.({
            ...activePage,
            nodes: activePage?.nodes?.filter((a) => {
                return (selection.nodes || []).findIndex((b) => b.id == a.id) < 0;
            }),
            edges: activePage?.edges?.filter((a) => {
                return (selection.edges || []).findIndex((b) => b.id == a.id) < 0;
            })
        })
        setSelection({});
    }, [selection, activePage])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            switch(e.key){
                case 'Escape':
                    setActiveTool(undefined);
                    break;
                case 'Delete':
                case 'Backspace':
                    onDelete();
                    break;
            }
        }

        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [onDelete])

    return (
        <ReactFlowProvider>
            <ElectricalNodesProvider value={{elements}}>
                <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            
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
                            templates={props.templates}
                            selectedPage={selectedPage}
                            onCreatePage={props.onCreatePage}
                            onUpdatePage={props.onUpdatePage}
                            onDeletePage={props.onDeletePage}

                            onCreateTemplate={props.onCreateTemplate}
                            onUpdateTemplate={props.onUpdateTemplate}
                            onDeleteTemplate={props.onDeleteTemplate}
                            
                            onReorderPage={props.onUpdatePageOrder}
                            onSelectPage={(pageId) => {
                                setSelectedPage(pageId)
                            }} />
                        
                        <Divider orientation='vertical' />
                        <Box sx={{flex: 1, display: 'flex'}}>
                            <ElectricalSurface
                                page={{
                                    ...activePage,
                                    number: activePageIndex
                                }}
                                project={{
                                    name: props.title,
                                    version: selectedVersion?.rank,
                                    versionDate: moment(selectedVersion?.createdAt).format('hh:mma - DD/MM/YY')
                                }}
                                onUpdate={(page) => {
                                    props.onUpdatePage?.(page)
                                }}
                                selection={selection}
                                onSelect={(selection) => {
                                    console.log(selection);
                                    setSelection(selection)
                                }}
                                clipboard={{}}
                                activeTool={activeTool}
                                />
                        </Box>
                        <Divider orientation='vertical' />
                        <SymbolsPane
                            activeTool={activeTool}
                            onSelectSymbol={(symbol) => {
                                setActiveTool({type: 'symbol', data: {symbol: elements?.find((a) => a.name == symbol)}})
                            }}
                            />
                    </Box>
                </Paper>
            </ElectricalNodesProvider>
        </ReactFlowProvider>
    )
}