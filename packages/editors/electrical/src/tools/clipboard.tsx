import { MouseEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { nodeTypes, edgeTypes } from "@hive-command/electrical-nodes";
import { OverlayProps, ToolFactory, ToolFactoryProps, ToolInstance } from "./shared";
import { useReactFlow, useStoreApi, useViewport } from "reactflow";
import { nanoid } from "nanoid";
import { isEqual } from 'lodash';

export const ClipboardTool: ToolFactory<{}> = forwardRef<ToolInstance, ToolFactoryProps>((props, ref) => {

    const { surface, page, onUpdate } = props;

    const { zoom } = useViewport();

    const { project } = useReactFlow();

    const [clipboard, setClipboard] = useState<any>({})

    const store = useStoreApi()

    useEffect(() => {
        if (!isEqual(clipboard, surface?.state?.activeTool?.data)) {
            setClipboard(surface?.state?.activeTool?.data || {})
        }
    }, [surface?.state?.activeTool?.data])

    const onClick = (e: MouseEvent) => {

        const position = project({
            x: (e.clientX || 0),
            y: (e.clientY || 0)
        })

        const { nodes: _nodes = [], edges: clipboardEdges = [] } = clipboard?.items || { nodes: [], edges: [] };

        const clipboardNodes = store.getState().getNodes()?.filter((a) => {
            return _nodes.findIndex((b: any) => b.id == a.id) > -1
        });
    
   
        let xPositions = clipboardNodes.map((x: any) => x.position.x)?.concat(
            clipboardEdges?.filter?.((a: any) => {
                return isFinite(Math.min(...a?.data?.points?.map((y: any) => y.x)))
            })?.map((x: any) => {
                let min = Math.min(...x?.data?.points?.map((y: any) => y.x))
                return min;
            })
        )
    
        let yPositions = clipboardNodes.map((x: any) => x.position.y)?.concat(
            clipboardEdges?.filter?.((a: any) => {
                return isFinite(Math.min(...a?.data?.points?.map((y: any) => y.y)))
            })?.map((x: any) => {
                let min = Math.min(...x?.data?.points?.map((y: any) => y.y))
                return min;
            })
        )
    
    
        let minX = Math.min(...xPositions)
        let minY = Math.min(...yPositions)
    
        const width = (maxX - minX) * 1.5;
        const height = (maxY - minY) * 1.5;

        console.log(minX, minY);

        let nodes = (page?.nodes || []).slice();
        let edges = (page?.edges || []).slice();

        nodes = nodes.concat(clipboard?.items?.nodes?.map((item: any) => ({
            id: nanoid(),
            type: item.type,
            position: {
                x: position.x + (item.position.x - minX),
                y: position.y + (item.position.y - minY)
            },
            data: {
                ...item.data
            }
        })))

        edges = edges.concat(clipboard?.items?.edges?.map((item: any) => ({
            id: nanoid(),
            type: 'wire',
            source: 'canvas',
            target: 'canvas',
            data: {
                points: item.data?.points?.map((point: any) => ({
                    x: position.x + (point.x - minX),
                    y: position.y + (point.y - minY)
                }))
            }
        })))

        if (clipboard.cut) {
            nodes = nodes.filter((a: any) => clipboard.items?.nodes?.findIndex((b: any) => a.id == b.id) < 0)
            edges = edges.filter((a: any) => clipboard.items?.edges?.findIndex((b: any) => a.id == b.id) < 0)
        }

        onUpdate?.({
            ...page,
            nodes,
            edges
        })
    }

    useImperativeHandle(ref, () => ({
        onClick,
    }));

    const { nodes: _nodes = [], edges = [] } = clipboard?.items || { nodes: [], edges: [] };

    const nodes = store.getState().getNodes()?.filter((a) => {
        return _nodes.findIndex((b: any) => b.id == a.id) > -1
    });

    let xPositions = nodes.map((x: any) => x.position.x)?.concat(
        edges?.filter?.((a: any) => {
            return isFinite(Math.min(...a?.data?.points?.map((y: any) => y.x)))
        })?.map((x: any) => {
            let min = Math.min(...x?.data?.points?.map((y: any) => y.x))
            return min;
        })
    )

    let yPositions = nodes.map((x: any) => x.position.y)?.concat(
        edges?.filter?.((a: any) => {
            return isFinite(Math.min(...a?.data?.points?.map((y: any) => y.y)))
        })?.map((x: any) => {
            let min = Math.min(...x?.data?.points?.map((y: any) => y.y))
            return min;
        })
    )

    let xWidthPositions = nodes.map((x: any) => x.position.x + x.width)?.concat(
        edges?.filter?.((a: any) => {
            return isFinite(Math.max(...a?.data?.points?.map((y: any) => y.x)))
        })?.map((x: any) => {
            let min = Math.max(...x?.data?.points?.map((y: any) => y.x))
            return min;
        })
    )

    let yHeightPositions = nodes.map((x: any) => x.position.y + x.height)?.concat(
        edges?.filter?.((a: any) => {
            return isFinite(Math.max(...a?.data?.points?.map((y: any) => y.y)))
        })?.map((x: any) => {
            let min = Math.max(...x?.data?.points?.map((y: any) => y.y))
            return min;
        })
    )


    let minX = Math.min(...xPositions)
    let minY = Math.min(...yPositions)

    let maxX = Math.max(...xWidthPositions)
    let maxY = Math.max(...yHeightPositions)

    const width = (maxX - minX) * 1.5;
    const height = (maxY - minY) * 1.5;

    const renderedNodes = useMemo(() => {
        return nodes?.map((x: any) => {

            const NodeComponent = (nodeTypes as any)[x.type];
            return (<div style={{ position: 'absolute', left: (x.position.x - minX), top: (x.position.y - minY) }}>
                <NodeComponent {...x} id={`tmp-${nanoid()}`} />
            </div>
            )
        })
    }, [nodes, nodeTypes]);

    const renderedEdges = useMemo(() => {
        return edges?.map((x: any) => {
            let points = x?.data?.points?.map((p: any) => {
                return {
                    x: p.x - minX,
                    y: p.y - minY
                }
            });

            const EdgeComponent = (edgeTypes as any)[x.type];

            return <EdgeComponent {...x} data={{ ...x.data, points }} id={`tmp-${nanoid()}`} />
        })
    }, [edges, edgeTypes])

    return (
        <div style={{
            position: 'absolute',
            width: Math.abs(width),
            height: Math.abs(height),
            transformBox: 'fill-box',
            transformOrigin: 'top left',
            transform: `scale(${zoom})`,
            pointerEvents: 'none',
            left: (props.cursorPosition?.x || 0),
            top: (props.cursorPosition?.y || 0)
        }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {renderedNodes}
                <svg style={{ width: '100%', height: '100%' }}>
                    {renderedEdges}
                </svg>
            </div>
        </div>
    )
})