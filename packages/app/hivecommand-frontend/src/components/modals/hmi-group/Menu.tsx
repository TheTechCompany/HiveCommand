import React, {useState, useContext} from 'react';

import { Box, Button, Collapsible, List, Select, Text, TextInput } from 'grommet'
import { GridView as Nodes, Remove as Subtract, ImportExport as Connect, Add } from '@mui/icons-material';
import { NodeDropdown } from '../../node-dropdown';
import SvgSettings from '../../../views/Editor/pages/program/Settings';
import { BumpInput } from '@hexhive/ui';
import { HMIGroupContext } from './context';

export const HMIGroupMenu = (props) => {
	const [ selectedMenu, setSelectedMenu ] = useState<string>(undefined);

	const [ selected, setSelected ] = useState<any>()

	const { selected: selectedNode, devices, nodes, ports, updateNode, addPort, updatePort } = useContext(HMIGroupContext)

	console.log({ports});
	
	const renderMenu = () => {
		let node = nodes.find((a) => a.id == selectedNode)

		console.log({node, devices})
		switch(selectedMenu){
			case 'nodes':
				return (
					<NodeDropdown
						items={props.nodeMenu || []} />
				)
			case 'settings':
				return <Box>
					<Select
						valueKey={{ reduce: true, key: "id" }}
						labelKey="name"
						value={node?.extras?.devicePlaceholder?.id || node?.extras?.device}
						onChange={({ value }) => {
							// assignHMINode(selected.id, value).then(() => {
							// 	refetch()
							// })
							updateNode(selectedNode, {
								device: value
							})
						}}
						options={devices.filter((a) => a.type?.name.replace(/ /, '').indexOf(node?.extras?.iconString || node?.extras?.iconStr ) > -1)}
						placeholder="Device" />
					<BumpInput	
						value={node?.extras?.rotation || 0}
						leftIcon={<Subtract fontSize="small" />}
						onLeftClick={() => {
							updateNode(selectedNode, {
								rotation: (node?.extras?.rotation || 0) - 90
							})
						}}
						onRightClick={() => {
							updateNode(selectedNode, {
								rotation: (node?.extras?.rotation || 0) + 90
							})
						}}
						onChange={(e) => {
							updateNode(selectedNode, {
								rotation: e
							})
						}}
						rightIcon={<Add fontSize="small" />}
						placeholder="Rotation" />
					<BumpInput 
						type="number"
						value={node?.extras?.scaleX || 0}
						onLeftClick={() => {
							updateNode(selectedNode, {
								scaleX: parseFloat(node?.extras?.scaleX || 1) - 1
							})
						}}
						onRightClick={() => {
							updateNode(selectedNode, {
								scaleX: parseFloat(node?.extras?.scaleX || 1) + 1
							})
						}}
						onChange={(e) => {
							updateNode(selectedNode, {
								scaleX: parseFloat(e)
							})
						}}
						leftIcon={<Subtract fontSize="small" />}
						rightIcon={<Add fontSize="small" />}
						placeholder="Scale X" />
					<BumpInput 
						type="number"

						onLeftClick={() => {
								updateNode(selectedNode, {
									scaleY: parseFloat((node?.extras?.scaleY || 1)) - 1
								})
							}}
						onRightClick={() => {
								updateNode(selectedNode, {
									scaleY: parseFloat((node?.extras?.scaleY || 1)) + 1
								})
							}}
						onChange={(e) => {
							updateNode(selectedNode, {
								scaleY: parseFloat(e)
							})
						}}
						value={node?.extras?.scaleY || 0}
						leftIcon={<Subtract fontSize="small"  />}
						rightIcon={<Add fontSize="small" />}
						placeholder="Scale Y" />
				</Box>
			case 'ports':
				return (
					<Box>
						<Box align="center" justify="between" direction="row">
							<Text size="small">Ports</Text>
							<Button 
								onClick={addPort}
								hoverIndicator
								plain 
								style={{padding: 6, borderRadius: 3}} 
								icon={<Add  fontSize="small"  />} />
						</Box>
						<Box flex overflow="scroll">
							<List 
								pad="none"
								primaryKey="key"
								data={ports}>
								{(datum) => (
									<>
									<Box
										pad={{vertical: 'xsmall'}}
										flex
										onClick={() => setSelected(selected == datum.id ? undefined : datum.id)}
										direction="column">
										{/* <Text>{datum.key || "new port"}</Text>
									</Box>
									<Collapsible open={selected == datum.id}> */}
										<TextInput 
											onChange={(e) => updatePort(datum.id, {key: e.target.value})}
											placeholder="Port ID" 
											size="small" 
											value={datum.key} />
										<Box direction="row">
											<TextInput 
												onChange={(e) => updatePort(datum.id, {x: parseFloat(e.target.value) })}
												value={datum.x}
												placeholder="X" 
												type="number" />
											<TextInput 
												onChange={(e) => updatePort(datum.id, {y: parseFloat(e.target.value) })}
												value={datum.y}
												placeholder="Y" 
												type="number" />
										</Box>
										<Box direction="row">
											<TextInput 
												value={datum.height}
												onChange={(e) => updatePort(datum.id, { height: parseFloat(e.target.value) }) }
												placeholder="Length"
												type="number" />
										</Box>
										<TextInput 
											onChange={(e) => updatePort(datum.id, {rotation: parseFloat(e.target.value) })}
											value={datum.rotation}
											placeholder="Rotation" 
											type="number" />
									{/* </Collapsible> */}
									</Box>
									</>
								)}
							</List>
						</Box>
					</Box>
				)
			default:
				return;
		}
	}
	return (
		<>
		<Collapsible
			direction="horizontal"
			open={Boolean(selectedMenu)}
			>
			<Box overflow="scroll" pad={'xsmall'} width="small">
				{renderMenu()}
			</Box>
		</Collapsible>
		<Box elevation="small" background="accent-1">
			
			<Button
				active={selectedMenu == 'nodes'}
				hoverIndicator
				onClick={() => setSelectedMenu(selectedMenu == 'nodes' ? undefined : 'nodes')}
				icon={<Nodes />} />
			
			<Button
				active={selectedMenu == 'settings'}
				hoverIndicator
				onClick={() => setSelectedMenu(selectedMenu == 'settings' ? undefined : 'settings')}
				icon={<SvgSettings  width={30} height={30}/>} />

			<Button
				active={selectedMenu == 'ports'}
				hoverIndicator
				onClick={() => setSelectedMenu(selectedMenu == 'ports' ? undefined : 'ports')}
				icon={<Connect />} />
		</Box>
		</>
	)
}