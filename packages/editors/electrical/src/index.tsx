import React, { useCallback, useEffect, useMemo, useState, useRef, useReducer } from 'react';
import { EditorToolbar } from '@hive-command/editor-toolbar'
import { Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { ActiveTool, Tools, ToolMenu, ToolInstance } from './tools';
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
import { useEditorFocus } from './hooks/useEditorFocus';


export interface ElectricalEditorProps {
    title: string;

    versions: ElectricalVersion[]
    pages: ElectricalPage[]
    templates?: { id: string, name: string }[];

    onExport?: () => void;

    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
    onDeletePage?: (page: any) => void;


    onCreateTemplate?: (page: any) => void;
    onUpdateTemplate?: (page: any) => void;
    onDeleteTemplate?: (page: any) => void;


    onUpdatePageOrder?: (id: string, above: any, below: any) => void;
}



export const ElectricalEditor: React.FC<ElectricalEditorProps> = (props) => {


    const sortedPages = useMemo(() => props.pages?.slice()?.sort((a, b) => (a.rank || '').localeCompare(b.rank || '')), [props.pages])

    // const selectedVersion = props.versions?.[props.versions?.length - 1];

    const [selectedVersion, setSelectedVersion] = useState<ElectricalVersion | null>(null)

    const [selectedPage, setSelectedPage] = useState<any | null>(null);

    const elements = useComponents();

    const activePage = sortedPages?.find((a) => a.id == selectedPage?.id);

    const activePageIndex = sortedPages?.findIndex((a) => a.id == selectedPage?.id);

    const activeTemplate = props.templates?.find((a) => a.id == selectedPage?.id);

    const [activeTool, setActiveTool] = useState<ActiveTool>()

    const [selection, setSelection] = useState<EditorCanvasSelection>({});

    const [clipboard, setClipboard] = useState<any>(null);

    const tools = useMemo(() => ToolMenu(), [])

    const toolRef = useRef<ToolInstance | null>(null);

    const [ keyRng, setKeyRng ] = useState(0)

    const { editorActive, onEditorEnter, onEditorLeave } = useEditorFocus();

    const onDelete = () => {
        console.log("Deleting ", selection, activePage?.edges?.filter((a) => {
            return (selection.edges || []).indexOf(a.id) < 0;
        }))
        const sel = Object.assign({}, selection);
        
        const updatedPage = {
            ...activePage,
            nodes: activePage?.nodes?.filter((a) => {
                return (selection.nodes || []).indexOf(a.id) < 0;
            }),
            edges: activePage?.edges?.filter((a) => {
                return (selection.edges || []).indexOf(a.id) < 0;
            })
        }
        console.log({updatedPage});

        props.onUpdatePage?.(updatedPage)

        setSelection({});
    }

    const onKeyDown = (e: KeyboardEvent) => {

        const key = e.key;
     

        if(e.key == 'Escape'){
            e.stopPropagation();
        
            setActiveTool(undefined);
            setSelection({});
        }


        if(editorActive){
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case "c":
                        // dispatch({type: 'onCopy'})
                        onCopy?.();
                        return;
                    case "v":
                        onPaste?.()
                        return;
                    case "x":
                        onCut?.();
                        //TODO temp cut from board finish when pasted
                        return;
                }
            } else {
                switch (e.key) {        
                    case 'Tab':
                        e.preventDefault();
                        
                        break;
                    case 'Delete':
                    case 'Backspace':
                        onDelete?.();
                        break;
                }
            }
            toolRef?.current?.onKeyDown?.(e as any);

            setKeyRng((k) => (k + 1) % 10)

        }

        
        
    }

    const mapSelection = (selection: EditorCanvasSelection) => {
        return {
            nodes: selection.nodes?.map((n) => activePage?.nodes?.find((a) => a.id == n)),
            edges: selection.edges?.map((n) => activePage?.edges?.find((a) => a.id == n)),
        }
    }

    const onCopy = () => {
        setClipboard({ cut: false, items: mapSelection(selection) })
    }

    const onCut = () => {
        setClipboard({ cut: true, items: mapSelection(selection) });
    }

    const onPaste = () => {
        console.log("CLIPBOARD", clipboard)
        setActiveTool({ type: 'clipboard', data: clipboard })
        setSelection({})//TODO Change to the temp ids of anything in clipboard
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [editorActive, selection, activePage, clipboard])


    return (
        <ReactFlowProvider>
            <ElectricalNodesProvider value={{ elements }}>
                <Paper
                    tabIndex={0}
                    // onKeyDown={onKeyDown}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        userSelect: 'none'
                    }}>

                    <EditorToolbar
                        title={props.title}
                        tools={tools}
                        activeTool={activeTool}
                        onToolChange={(tool, data) => {
                            setActiveTool(tool ? { type: tool, data } : undefined)
                        }}
                        versions={props.versions}
                        activeVersion={selectedVersion?.id}
                        onExport={props.onExport}
                    />
                    <Divider />
                    <Box sx={{ flex: 1, display: 'flex' }}>
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
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <ElectricalSurface
                                ref={toolRef}
                                keyRng={keyRng}
                                page={{
                                    ...activePage,
                                    number: activePageIndex
                                }}
                                project={{
                                    name: props.title,
                                    version: selectedVersion?.rank,
                                    versionDate: moment(selectedVersion?.createdAt).format('hh:mma - DD/MM/YY')
                                }}
                                onUpdate={props.onUpdatePage}
                                selection={selection}
                                onSelect={(selection) => {
                                    setSelection(selection)
                                }}
                                onEditorEnter={onEditorEnter}
                                onEditorLeave={onEditorLeave}
                                activeTool={activeTool}
                            />
                        </Box>
                        <Divider orientation='vertical' />
                        <SymbolsPane
                            activeTool={activeTool}
                            onSelectSymbol={(symbol) => {
                                setActiveTool({ type: 'symbol', data: { symbol: elements?.find((a) => a.name == symbol) } })
                            }}
                        />
                    </Box>
                </Paper>
            </ElectricalNodesProvider>
        </ReactFlowProvider>
    )
}