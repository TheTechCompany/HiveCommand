import { Box } from 'grommet';
import React, {useMemo, useContext} from 'react';
import { getSVGStyle } from '../../hooks/svg';
import * as HMIIcons from '../../assets/hmi-elements'
import { RetractingPort } from '@hexhive/ui';
import { HMICanvasContext } from '../hmi-canvas/HMICanvasContext';
import { Icon } from './Icon';

export interface HMIGroupProps {
	building?: boolean;
	extras?: {
		nodes?: any[];
		ports?: any[];
		icons: (string | any)[];
	}
	width?: number;
	height?: number;
}

const PORT_ANCHOR = {x: 300, y: 60}


export const HMIGroup : React.FC<HMIGroupProps> = (props) => {

	const { getDeviceOptions, getDeviceConf } = useContext(HMICanvasContext)

	let nodes = useMemo(() => {
		return props.extras.nodes?.sort((a, b) => (a.z || 0) - (b.z || 0)).map((node) => {
			let options : any = {};
			let conf : any = {};
			if(getDeviceOptions) {
				options = getDeviceOptions(node.devicePlaceholder?.name);
			}
			if(getDeviceConf) {
				conf = getDeviceConf(node.devicePlaceholder?.name);
			}
			
			// const options = getDeviceOptions(node?.devicePlaceholder?.name)
			// const conf = getDeviceConf(node?.devicePlaceholder?.name)

			return {
				id: node.id,
				extras: {
					icon: <Icon icon={node.type.name} options={options}/>,
					options,
					conf
				},
				x: node.x - PORT_ANCHOR.x,
				y: node.y - PORT_ANCHOR.y,
				width: node.width,
				height: node.height,
				device: node.devicePlaceholder,
				rotation: node.rotation,
				scaleX: node.scaleX,
				scaleY: node.scaleY
			}
		})
	}, [props.extras.nodes]);
	// const Icons = props.icons.map((icon) => {
	// 	return useSVGStyle(icon && typeof(icon) === 'string' ? (Icons as any)[icon] : (icon) ? icon : Icons.Previous, (props) => ({
	// 		stroke: props.options?.open == 'true' || props.options?.on == 'true' ? 'green' : 'gray',
	// 		filter: `hue-rotate(${((props.options?.open == true || props.options?.open == 'true') || (props.options?.on == 'true')) ? '45' : '0'}deg)`
    // 	}));
	// })

	console.log("GROUP", {nodes: props.extras.nodes})

	// console.log(Icons)
	const ports = useMemo(() => {
		return props.extras?.ports?.map((port) => ({
			id: port.id,
			x: port.x - PORT_ANCHOR.x,
			y: port.y - PORT_ANCHOR.y,
			rotation: port.rotation,
			length: port.length
		}))
	}, [props.extras.ports]);

	const {width, height} = useMemo(() => {
		const xMin = Math.min(...nodes.map((x) => x.x))
		const yMin = Math.min(...nodes.map((x) => x.y))
		const xMax = Math.max(...nodes.map((x) => (x.x + x.width) * x.scaleX))
		const yMax = Math.max(...nodes.map((x) => (x.y + x.height) * x.scaleY));
		console.log(xMin, yMin, xMax, yMax, {nodes})
		return {width:( xMax - xMin), height: yMax - yMin}
	}, [nodes])

	return (
		<Box style={{position: 'relative'}}>
			{nodes.map((Node) => 
				<div
					style={{
						// background: 'red',
						// pointerEvents: props.building ? 'none' : undefined, 
						position: 'absolute', 
						width: Node.width || '55px', 
						height: Node.height || '55px', 
						transform: `rotate(${Node.rotation || 0}deg) scaleX(${Node.scaleX || 1}) scaleY(${Node.scaleY || 1})`, 
						left: Node.x, 
						top: Node.y
					}}> 
						{React.cloneElement(Node.extras.icon, {device: Node.device, scaleX: Node.scaleX, scaleY: Node.scaleY, rotation: Node.rotation, conf: Node.extras.conf, options: Node.extras.options})}
				</div>)}
			{ports.map((Port) => 
				<div style={{position: 'absolute', left: Port.x, top: Port.y}}>
					<RetractingPort id={Port.id} rotation={Port.rotation} height={Port.length} />
				</div>)}
			{/* {Icons.map((Icon) => <Icon />)} */}
		</Box>
	)
}