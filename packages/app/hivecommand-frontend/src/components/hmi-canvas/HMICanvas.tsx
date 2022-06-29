import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, List, Button, Collapsible, TextInput, Select } from 'grommet'
import { InfiniteCanvas, IconNodeFactory, InfiniteCanvasNode, ZoomControls, InfiniteCanvasPath } from '@hexhive/ui';
import { HMINodeFactory } from '../hmi-node/HMINodeFactory';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import * as HMIIcons from '../../assets/hmi-elements'
import { HMICanvasProvider } from './HMICanvasContext';
import { CanvasStyle } from '../../style';

export interface HMICanvasProps {
	id: string;
    
    information?: any;

    modes?: {
        name: string,
        mode: string
    }[]
    deviceValues?: {
        conf: {
            device: {id: string},
            conf: {key: string}, 
            value: any
        }[], 
        devicePlaceholder: {
            id: string, 
            name: string
        }, 
        values: any
    }[];
    program?: any;
	
	onConnect?: (path: {
		source: string,
		sourceHandle: string,
		target: string,
		targetHandle: string
	}) => void;

	onSelect?: (selection: {
		key: "node" | "path",
		id: string
	}) => void;

    onBackdropClick?: () => void;
}


export const HMICanvas : React.FC<HMICanvasProps> = (props) => {
    
    const [ zoom, setZoom ] = useState(120);
    const [ offset, setOffset ] = useState({x: 250, y: 150})

    const [ selected, _setSelected ] = useState<{key?: "node" | "path", id?: string}>({})
    const selectedRef = useRef<{selected?: {key?: "node" | "path", id?: string}}>({})
    const setSelected = (s: {key?: "node" | "path", id?: string}) => {
        _setSelected(s)
        selectedRef.current.selected = s;
    }

    const [ menuOpen, openMenu ] = useState<string | undefined>(undefined);

    const [ nodes, setNodes ] = useState<InfiniteCanvasNode[]>([])
    const [ paths, _setPaths ] = useState<InfiniteCanvasPath[]>([])
    
    const pathRef = useRef<{paths: InfiniteCanvasPath[]}>({paths: []})

    const setPaths = (paths: InfiniteCanvasPath[]) => {
        _setPaths(paths)
        pathRef.current.paths = paths;
    }

    const updateRef = useRef<{addPath?: (path: any) => void, updatePath?: (path: any) => void}>({
        updatePath: (path) => {
            let p = pathRef.current.paths.slice()
            let ix = p.map((x) => x.id).indexOf(path.id)
            p[ix] = path;
            setPaths(p)
        },
        addPath: (path) => {
            let p = pathRef.current.paths.slice()
            p.push(path)
            setPaths(p)
        }
    })

    const client = useApolloClient()

   
    const refetch = () => {
        client.refetchQueries({include: ['Q']})
    }

    
    useEffect(() => {
        let program = props.program
        if(program){
            let hmi = program.interface //TODO change to a default flag on the HMI

            const nodes = hmi?.nodes?.filter((a) => !a.children || a.children.length == 0);
            const groups = hmi?.nodes?.filter((a) => a.children && a.children.length > 0);

            setNodes(nodes?.map((x) => {

                return {
                    id: x.id,
                    x: x.x,
                    y: x.y,
                    width: `${x?.type?.width || 50}px`,
                    height: `${x?.type?.height || 50}px`,
                    extras: {
                      
                        // options: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.values,
                        // configuration: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.conf.reduce((prev,curr) => ({...prev, [curr.conf.key]: curr.value}), {}),
                        ports: (x?.type?.ports || []).map((x) => ({...x, id: x.key})),
                        rotation: x?.rotation || 0,
                        scaleX: x?.scaleX || 1,
                        scaleY: x?.scaleY || 1,
                        // color: x.type == 'BallValve' || x.type == "DiaphragmValve" ? (props.deviceValues.find((a) => a.devicePlaceholder.name == x.devicePlaceholder.name)?.values == "false" ? '0deg' : '60deg') : '0deg',
                        devicePlaceholder: x.devicePlaceholder,
                        iconString: x?.type?.name,
                        icon: HMIIcons[x?.type?.name],
                    },
                    type: 'hmi-node',
                }
                
            }).concat((groups || []).map((group) => {

                let widths =  group.children?.map((x) => x.x + (x.type?.width || 50));
                let heights =  group.children?.map((x) => x.y + (x.type?.height || 50));
                let width = Math.max(...widths) - Math.min(...widths)
                let height = Math.max(...heights) - Math.min(...heights)

                return {
                    id: group.id,
                    x: group.x || 0,
                    y: group.y || 0,
                    width: `${width}px`,
                    height: `${height}px`,
                    type: 'hmi-node',
                    extras: {
                        nodes: group.children?.map((x) => ({
                            id: x.id,
                            x: x.x,
                            y: x.y,
                            z: x.z,
                            devicePlaceholder: x.devicePlaceholder,
                            scaleX: x.scaleX || 1,
                            scaleY: x.scaleY || 1,
                            rotation: x.rotation || 0,
                            type: x.type
                        })),
                        ports: group.ports?.map((x) => ({
                            id: x.id,
                            x: x.x,
                            y: x.y,
                            length: x.length || 1,
                            rotation: x.rotation || 0,
                        }))
                    }
                }   
            })))

            setPaths(hmi?.edges?.map((x) => {
                return {
                    id: x.id,
                    source: x?.from?.id,
                    sourceHandle: x.fromHandle,
                    target: x?.to?.id,
                    targetHandle: x.toHandle,
                    points: x.points
                }

            }))
        }
    }, [props.program, props.deviceValues])

    useEffect(() => {
        window.addEventListener('keydown', watchEditorKeys)
        
        return () => {
            window.removeEventListener('keydown', watchEditorKeys)
        }
    }, [])
    const changeMenu = (view: string) => {
        openMenu(view == menuOpen ? undefined : view)
    }


    const watchEditorKeys = (e: KeyboardEvent) => {
        if(e.key == "Delete" || e.key == "Backspace") {
            if(selectedRef.current.selected.id){
                // deleteSelected({
                //     args: {
                //         selected: [selectedRef.current.selected].map((x) => ({
                //             type: x.key,
                //             id: x.id
                //         }))
                //     }
                // }).then(() => {
                //     refetch()
                // })
            }
        }
    }
    
	return (
        <HMICanvasProvider
            value={{
                values: props.deviceValues
            }}>
            <Box 
                direction="row"
                flex>
                <InfiniteCanvas
                    style={CanvasStyle}
                    zoom={zoom}
                    offset={offset}
                    onViewportChanged={({zoom, offset}) => {
                        setZoom(zoom)
                        setOffset(offset)
                    }}
                    onBackdropClick={props.onBackdropClick}
                    onSelect={(key, id) => {

                        props.onSelect({key, id})
                        setSelected({
                            key,
                            id
                        })
                    }} 
                    information={props.information}
                    editable={false}
                    nodes={nodes}
                    paths={pathRef.current.paths}
                    factories={[new IconNodeFactory(), new HMINodeFactory()]}
                    onPathCreate={(path) => {
        
                        updateRef.current?.addPath(path);
                    }}
                
                    >
        
                    <ZoomControls anchor={{vertical: 'bottom', horizontal: 'right'}} />
                </InfiniteCanvas>
            
            </Box>
        </HMICanvasProvider>
	)
}