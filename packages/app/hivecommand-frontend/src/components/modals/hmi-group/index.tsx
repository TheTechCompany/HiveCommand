import { InfiniteCanvas, RetractingPort } from '@hexhive/ui';
import { Box, Button } from 'grommet';
import { nanoid } from 'nanoid';
import React, {useState, useEffect} from 'react';
import { HMINodeFactory } from '../../hmi-node';
import { BaseModal } from '../base';
import { HMIGroupMenu } from './Menu';
import * as HMIIcons from '../../../assets/hmi-elements'
import { HMIGroupProvider } from './context';
import { CanvasStyle } from '../../../style';

const PORT_ANCHOR = {x: 300, y: 60}

export interface HMIGroupModalProps {
	onSubmit?: (item: any) => void
	onClose?: () => void;
	open: boolean;

	nodeMenu?: any[];
	base?: any;

	devices?: any[];
}


export const HMIGroupModal : React.FC<HMIGroupModalProps> = (props) => {

	const [ selected, setSelected ] = useState<{key?: string, id?: string}>({})

	const [ nodes, setNodes ] = useState<any[]>([]);
	const [ ports, setPorts ] = useState<any[]>([]);


	const onSubmit = () => {
		let ids = nodes.map((x) => x.id).concat(ports.map((x) => x.id))
		let coords = nodes.map((x) => ({x: x.x, y: x.y})).concat(ports.map((x) => ({x: PORT_ANCHOR.x + x.x, y: PORT_ANCHOR.y + x.y})))
// 
		// let datum = {x: Math.min(...coords.map((x) => x.x)), y: Math.min(...coords.map((x) => parseFloat(x.y)))}}
		
	
		let group = {
			nodes: nodes.map((node) => ({
				...node,
				id: node.id.indexOf(`tmp-`) > -1 ? undefined : node.id,
			})),
			ports: ports.map((port) => ({
				...port,
				x: PORT_ANCHOR.x + port.x,
				y: PORT_ANCHOR.y + port.y,
				// height: port.length,
				id: port.id.indexOf('tmp-') > -1 ? undefined : port.id
			}))
		}

		props.onSubmit?.(group)
	}

	useEffect(() => {
		if(props.base){

			if(props.base.extras.nodes){
				console.log({nodes: props.base.extras.nodes});

				setNodes(props.base.extras.nodes?.map((node) => ({
					...node,
					width: node.type.width ? `${node.type.width}px` : '55px',
					height: node.type.height ? `${node.type.height}px` : '55px',
					extras: {
						device: node?.devicePlaceholder?.id || node?.extras?.device,
						scaleX: node.scaleX,
						scaleY: node.scaleY,
						rotation: node.rotation,
						iconStr: node.type.name,
						icon: HMIIcons[node.type.name]
					},
					type: 'hmi-node'
				})))

				setPorts(props.base.extras.ports.map((port) => ({
					...port,
					height: port.length,
					x: port.x - PORT_ANCHOR.x,
					y: port.y - PORT_ANCHOR.y,
				})))
			}else{
				const iconString = props.base.extras.iconString;
				setNodes([{
					id: 'base',
					x: 300,
					y: 0,
					extras: {
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
						device: props.base?.devicePlaceholder?.id || props.base?.extras?.device,
						iconStr: iconString,
						icon: HMIIcons[iconString]
					},
					type: 'hmi-node'
				}])
			}

			console.log({base: props.base})
			
		}
	}, [props.base])

	

	return (
		<HMIGroupProvider value={{
			nodes,
			ports,
			devices: props.devices,
			selected: selected.id,
			addPort: () => {
				setPorts([...ports, {
					id: `tmp-${nanoid()}`
				}])
			},
			updatePort: (id, update) => {
				let p = ports.slice()
				let ix = p.map((x) => x.id).indexOf(id)
				if(ix > -1){
					p[ix] = {...p[ix], ...update}
				}

				setPorts(p)
			},
			updateNode: (id, update) => {
				console.log({id, update});

				let n = nodes.slice()
				let ix = n.map((x) => x.id).indexOf(id);
				if(ix > -1){
					n[ix].extras = {
						...n[ix].extras,
						...update
					}
					setNodes(n)
				}
			}
		}}>
			<BaseModal
				padding={"none"}
				gap={"none"}
				width="xlarge"
				title="Create HMI Grouping"
				open={props.open}
				onClose={props.onClose}
				onSubmit={onSubmit}>
				<Box 
					direction="row"
					height={{min: '400px'}}>
					<InfiniteCanvas
						style={CanvasStyle}
						onDelete={() => {
							console.log("DELETE")
						}}
						editable={true}
						factories={[HMINodeFactory(true)]}
						menu={(
							<HMIGroupMenu 
								selected={selected}
								
								nodeMenu={props.nodeMenu.map((x) => ({
									...x, 
									icon: (
										<Box style={{stroke: 'gray'}}>
											{x.icon}
										</Box>)
								}))} />
						)} 
						onSelect={(key, id) => {
							setSelected({key, id})
						}}
						onNodeUpdate={(node) => {
							let n = nodes.slice()
							let ix = nodes.map((x) => x.id).indexOf(node.id);
							if(ix > -1){
								n[ix].x = node.x;
								n[ix].y = node.y;
							}

							setNodes(n)
						}}
						
						onNodeCreate={(position, data) => {
							const iconStr = data.extras.icon;
							const icon = HMIIcons[iconStr];

							console.log("Drop", {data, HMIIcons, iconStr});
							const newElem =  {
								id: `tmp-${nanoid()}`,
								x: position.x, 
								y: position.y,
								width: typeof(data.extras.width) == "number" ? `${data.extras.width}px` :data.extras.width,
								height: typeof(data.extras.height) == "number" ? `${data.extras.height}px` : data.extras.height,
								extras: {
									icon: icon,
									iconStr,
									rotation: 0,
									
								},
								type: 'hmi-node'
							};
							console.log({newElem})

							setNodes([...nodes, newElem])
						}}
						nodes={nodes.concat([{id: 'root', x: 300, y: 50, extras: {
							ports: ports || [],
							icon: () => <div style={{background: 'red', width: 50, height: 50}}/>
						}, type: 'hmi-node'}])}
						
						paths={[]}
						/>
				</Box>
			</BaseModal>
		</HMIGroupProvider>
	)
}