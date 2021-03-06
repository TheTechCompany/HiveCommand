import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Collapsible } from 'grommet'
import { ActionNodeFactory, InfiniteCanvas, InfiniteCanvasNode, InfiniteCanvasPath, InfiniteCanvasPosition, ZoomControls } from '@hexhive/ui';
import { NodeDropdown } from '../node-dropdown';
import { nanoid } from 'nanoid';
import { IconMap } from '../../asset-map'

import { IconNodeFactory } from './icon-node';
import { CanvasStyle } from '../../style';

export interface ProgramCanvasProps {
	nodes: InfiniteCanvasNode[],
	paths: InfiniteCanvasPath[]

	onNodeUpdate?: (node: InfiniteCanvasNode) => void;
	onNodeCreate?: (position: InfiniteCanvasPosition, node: InfiniteCanvasNode) => void;

	onPathCreate?: (path: InfiniteCanvasPath) => void;

	selected?: any[];
	onSelect?: (selected: {key: "node" | "path", id: string}) => void;
	onDelete?: () => void;

	menu?: {
		key: string,
		icon: any,
		panel: any,
	}[]
}

export const ProgramCanvas : React.FC<ProgramCanvasProps> = (props) => {
	const [ nodes, setNodes ] = useState<InfiniteCanvasNode[]>([])
	
	const [ paths, _setPaths ] = useState<InfiniteCanvasPath[]>([])
    
    const pathRef = useRef<{paths: InfiniteCanvasPath[]}>({paths: []})

	const localPaths = useRef<{paths: string[]}>({paths: []})

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
			console.log("Add Path");

            let p = pathRef.current.paths.slice()
			
			localPaths.current.paths = [...localPaths.current.paths, path.id];

            p.push({...path})
            setPaths(p)
        }
    })

	useEffect(() => {
		setPaths(props.paths)
	}, [props.paths])

	useEffect(() => {
		setNodes(props.nodes)
	}, [props.nodes])
	
	const [ menu, setMenu ] = useState<string>(undefined)


	return (
		<Box 
			direction="row"
			flex>
			<InfiniteCanvas 
				style={CanvasStyle}
			 	menu={(
				 	<Collapsible 
						onKeyPress={(e) => {
							console.log("KEY PRESS")
							e.preventDefault();
							e.stopPropagation()
						}}
						open={Boolean(menu)}
						direction="horizontal">
						<Box
							focusIndicator={false}
							onClick={(e) => {
								e.stopPropagation()
								e.preventDefault()
							}}
							pad={'xsmall'} 
							width="small">
								{/* {renderMenu()} */}
								{props.menu.find((a) => a.key == menu)?.panel}
						
						</Box>
					</Collapsible>
				)}
                editable={true}
                nodes={nodes}
				paths={pathRef.current.paths}
				selected={props.selected}
				onSelect={(key, id) => {
					console.log("SELECT", key, id)
					props.onSelect?.({key, id})
				}}
				onDelete={props.onDelete}
                factories={[new IconNodeFactory()]}
                onPathCreate={(path) => {
					console.log("path create", {path})
                    updateRef.current?.addPath(path);
                }}
                onPathUpdate={(path) => {
					console.log("Path Update", {path})

					if(path.source && path.target){

						let mod = path;
						if(localPaths.current.paths.includes(path.id)){
							mod.id = undefined;
						}
						props.onPathCreate?.({...mod})
					}
                   
                    updateRef.current?.updatePath(path)
                }}
                onNodeUpdate={(node) => {
					console.log("Update", {node})
					let n = nodes.slice()
					let ix = n.map((x) => x.id).indexOf(node.id)

					n[ix] = {
						...n[ix],
						...node,
					}

					setNodes(n);

					props.onNodeUpdate?.(node)
				}}
                onNodeCreate={(position, node) => {
					
					let n = nodes.slice()
					n.push({
						id: nanoid(),
						x: position.x,
						y: position.y,
						extras: {
                            icon: IconMap[node.extras.type]?.icon
                        },
                        type: IconNodeFactory.TAG
					})
					setNodes(n)
					console.log(n)

					console.log("DROP")
					props.onNodeCreate?.(position, node)


				}}
                >

                <ZoomControls
                    anchor={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}  />
            </InfiniteCanvas>
			<Box
				elevation="small"
				background="accent-1"
				>

				{props.menu.map((menu_item) => (
					<Button 
						hoverIndicator
						icon={menu_item.icon}
						active={menu == menu_item.key}
						onClick={() => {
							if(menu == menu_item.key){
								setMenu(undefined)
							}else{
								setMenu(menu_item.key)
							}
						}} />
				))}
			</Box>
		</Box>
	)
}