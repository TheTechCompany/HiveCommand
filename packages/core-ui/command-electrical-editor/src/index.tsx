import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider, List, ListItem, Paper, Typography, TextField, IconButton } from '@mui/material';
import { Canvas } from './canvas';
import { useRemoteComponents } from '@hive-command/remote-components'
import { ElectricalEditorProvider } from './context'
import { ReactFlowProvider } from 'reactflow';
import { PagesPane } from './panes/pages';
import { SymbolsPane } from './panes/symbols';
import { Create, CheckBoxOutlineBlank, HighlightAlt, FormatColorText } from '@mui/icons-material';
import { BoxToolProps, SymbolToolProps, TextToolProps } from './tools';
import { NodePropsModal } from './components/node-props';

export interface ECADPage {
    id: string;
    name: string;
    nodes?: any[];
    edges?: any[];
    rank?: string;

}

export interface ECadEditorProps {
    pages: ECADPage[]

    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any, log?: string) => void;
    onDeletePage?: (page: any) => void;
    onUpdatePageOrder?: (oldIx: number, newIx: number) => void;

    exporting?: boolean;
    onExport?: () => void;
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

const ToolProps = [
    {
        id: 'text',
        props: TextToolProps,
        icon: <FormatColorText />
    },
    {
        id: 'box',
        props: BoxToolProps,
        icon: <CheckBoxOutlineBlank />
    },
    {
        id: 'boxOutline',
        props: BoxToolProps,
        icon: <HighlightAlt />
    },
    {
        id: 'electricalSymbol',
        props: SymbolToolProps,
        icon: <Create />
    }
]


export const ECadEditor: React.FC<ECadEditorProps> = (props) => {

    const [editNode, setEditNode] = useState<any>(null);

    const [selectedPage, setSelectedPage] = useState<any>(null);

    const [pages, setPages] = useState<ECADPage[]>(props.pages || [])

    const [items, setItems] = useState<any[]>([]);

    const [draftWire, setDraftWire] = useState<any>(null);

    const [selectedSymbol, setSelectedSymbol] = useState<any>(null);
    const [symbolRotation, setSymbolRotation] = useState(0);

    const [tools, setTools] = useState<any[]>([]);

    const [activeTool, setActiveTool] = useState<any | null>(null);

    const { getPack } = useRemoteComponents()

    useEffect(() => {
        setPages(props.pages);
    }, [props.pages])

    const page = useMemo(() => pages?.find((a) => a.id == selectedPage), [selectedPage, pages])

    useEffect(() => {
        getPack('github-01', 'https://raw.githubusercontent.com/TheTechCompany/hive-command-electrical-symbols/main/dist/components/', 'index.js').then((pack) => {
            setItems((pack || []))
            console.log({ pack })
        })

    }, [])


    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key == 'Tab') {
                e.preventDefault();
                e.stopPropagation();

                setSymbolRotation((symbolRotation) => ((symbolRotation || 0) + 90) % 360);
            }

            if (e.key == 'Escape') {
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
                    page,
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
                <NodePropsModal
                    open={Boolean(editNode)}
                    options={editNode?.props}
                    onSubmit={(options: any[]) => {
                        let values = options.reduce((prev, curr) => {
                            return {
                                ...prev,
                                [curr.key]: curr.value
                            }
                        }, {})

                        let n = (page?.nodes || []).slice();
                        const ix = n?.findIndex((a) => a.id == editNode?.id);

                        n[ix] = {
                            ...n[ix],
                            data: {
                                ...n[ix].data,
                                ...values
                                // text: editText
                            }
                        }

                        console.log("new text")

                        // setApplying(true)

                        props.onUpdatePage?.({
                            ...page,
                            nodes: n
                        });

                        setEditNode(null);

                    }}
                    onClose={() => {
                        setEditNode(null);
                    }} />
                <Paper
                    sx={{ flex: 1, display: 'flex', height: '100vh' }}>
                    <PagesPane
                        exporting={props.exporting}
                        onExport={props.onExport}
                        onCreatePage={props.onCreatePage}
                        onDeletePage={props.onDeletePage}
                        onUpdatePage={props.onUpdatePage}
                        onSelectPage={(page: any) => setSelectedPage(page.id)}
                    />

                    <Box
                        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {Tools.map((tool) => (
                                <IconButton
                                    sx={{ borderRadius: '5px', marginRight: '3px', bgcolor: activeTool == tool.id ? 'secondary.main' : null }}
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
                            onEdit={(elem) => {

                                const { props }: any = ToolProps.find((a) => a.id == elem.type) || {}

                                if (props) {
                                    setEditNode({
                                        ...elem,
                                        props: Object.keys(props).map((key) => ({ key, type: props[key], value: elem?.data?.[key] }))
                                    })
                                }
                            }}
                        />
                    </Box>

                    <SymbolsPane />
                </Paper>
            </ElectricalEditorProvider>
        </ReactFlowProvider>

    )
}