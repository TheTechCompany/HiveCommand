import { HMICanvas } from '../components/hmi-canvas';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Check as Checkmark, ChevronLeft, SettingsEthernet } from '@mui/icons-material';
import { DeviceControlContext } from '../context';
import { getDevicesForNode, getNodePack, useNodesWithValues } from '../utils';
import { Bubble } from '../components/Bubble/Bubble';
// import { FormControl } from '@hexhive/ui';
// import { gql, useQuery } from '@apollo/client';
// import { useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment, Select, Box, Typography, TextField, Button, Paper, Divider, MenuItem, FormControl, InputLabel } from '@mui/material';
import { InfiniteScrubber } from '@hexhive/ui';
import { ActionMenu } from '../components/action-menu';
import moment from 'moment';

import { DataTypes, parseValue } from '@hive-command/scripting'
import { useRemoteComponents } from '@hive-command/remote-components';


const ActionButton = (props: any) => {
	return (
		<Box sx={{ display: 'flex' }}>
			<Button
				fullWidth
				color={props.color}
				size={props.size}
				variant="contained"
				disabled={props.waiting || props.disabled}

				onClick={props.onClick}
			>
				<Box sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between' }}>
					<Typography>{props.label}</Typography>
					{props.waiting && <CircularProgress size="xsmall" />}
				</Box>
			</Button>

		</Box>
	)
}
export const ControlView = () => {

	const operatingModes = [
		{
			label: 'Disabled',
			key: 'disabled'
		},
		{
			label: 'Auto',
			key: 'auto'
		},
		{
			label: 'Manual',
			key: 'manual'
		}
	]

	const [ infoView, setInfoView ] = useState<any>(null)


	const [ stateValues, setStateValues ] = useState<any>({});


	const {
		historize,
		client,
		functions,
		activePage,
		defaultPage,
		templatePacks = [],
		infoTarget,
		setInfoTarget,
		cache,
		activeProgram,
	} = useContext(DeviceControlContext)

	const { tags = [], types = [] } = activeProgram || {};

	const { values } = client?.useValues?.({tags: tags, types: types }) || {}

	const [hmiWithElems, setHMIWithElems] = useState<any[]>([])

    const { getPack } = useRemoteComponents(cache)

	const hmi = useMemo(() => {
        const activeInterface = activeProgram?.interface?.find((a) => activePage ? a.id === activePage : a.id === defaultPage);

        return activeInterface;

    }, [activeProgram, activePage, defaultPage])


	const fullHMIElements = useNodesWithValues(hmiWithElems, tags || [], functions, stateValues || {}, (newState) => {
        Object.keys(newState).map((tag) => {

            if (!Array.isArray(newState[tag]) && typeof(newState[tag]) === 'object' && Object.keys(newState[tag] || {}).length > 0) {
                Object.keys(newState[tag]).map((subkey) => client?.writeTagValue?.(tag, newState[tag][subkey], subkey))
            } else {
                client?.writeTagValue?.(tag, newState[tag])
            }

        })
    })
   

	const program = useMemo(() => ({
        ...activeProgram,
        interface: {
            id: '',
            // ...activeProgram?.interface,
            ...hmi,
            nodes: fullHMIElements
        },
        tags,
        types
    }), [activeProgram, hmi, fullHMIElements])

    useEffect(() => {

        (async () => {
            const activeNodes = (hmi?.nodes || []).filter((a: any) => !a.children || a.children.length == 0);

            const nodesWithElems = await Promise.all(activeNodes.map(async (node) => {

                const nodeElem = await getNodePack(node.type, templatePacks, getPack)

                let width = node.width || nodeElem?.metadata?.width //|| x.type.width ? x.type.width : 50;
                let height = node.height || nodeElem?.metadata?.height //|| x.type.height ? x.type.height : 50;


                return {
                    id: node.id,
                    type: 'hmi-node',
                    x: node.x,
                    y: node.y,
                    zIndex: node.zIndex || 1,
                    rotation: node.rotation || 0,
                    scaleX: node.scaleX || 1,
                    scaleY: node.scaleY || 1,
                    width,
                    height,
                    options: node.options,

                    dataTransformer: node?.dataTransformer,

                    extras: {
                        icon: nodeElem, //Icon from template pack
                        options: nodeElem?.metadata?.options || {}, //Options for node - related to extras.icon

                        //TODO: Figure out how to remove the duplication of options
                        rotation: node.rotation || 0,
                        zIndex: node.zIndex || 1,
                        scaleX: node.scaleX != undefined ? node.scaleX : 1,
                        scaleY: node.scaleY != undefined ? node.scaleY : 1,
                        // showTotalizer: x.showTotalizer || false,
                        ports: nodeElem?.metadata?.ports?.map((y) => ({ ...y, id: y.key })) || [],
                    }
                }

            }));
			console.log("SET HMI WItH ELEMS")

            setHMIWithElems(nodesWithElems)
        })();
    }, [ JSON.stringify(hmi), JSON.stringify(templatePacks) ])





	useEffect(() => {

		setStateValues(tags?.map((device) => {

			let deviceKey = `${device.name}`;

			// let device = program?.devices.find((a) => `${a.type.tagPrefix ? a.type.tagPrefix : ''}${a.tag}` == deviceKey);

			// device.type.state

			let fields = types?.find((a) => a.name === device.type)?.fields;
			let hasFields = (fields || []).length > 0;


			if(hasFields){
				let deviceValues = fields?.map((stateItem) => {

					// let deviceStateItem = device?.type.state.find((a) => a.key == valueKey)

					let currentValue = values?.[deviceKey]?.[stateItem.name];

					return {
						key: stateItem.name,
						value: parseValue(stateItem.type as keyof typeof DataTypes, currentValue)
					}

				}).reduce((prev, curr) => ({
					...prev,
					[curr.key]: curr.value
				}), {})

				return {
					key: deviceKey,
					values: deviceValues
				}
			}else{
				return {
					key: deviceKey,
					values: parseValue(device.type as keyof typeof DataTypes, values?.[deviceKey])
				}
			}
		}).reduce((prev, curr) => ({
			...prev,
			[curr.key]: curr.values
		}), {}))

	}, [ JSON.stringify(values), JSON.stringify(tags), JSON.stringify(types) ])



	useEffect(() => {

		const DataComponent : any = infoTarget?.dataFunction;

		const view = infoTarget != undefined ? 
			(<Bubble
				style={{ 
					position: 'absolute', 
					zIndex: 99, 
					pointerEvents: 'all', 
					display: 'flex',
					flexDirection: 'column',
					padding: '12px',
					left: ((infoTarget?.x || 0) + (infoTarget?.width || 0)) + 6, 
					top: ((infoTarget?.y || 0) + (infoTarget?.height || 0)) + (195 / 2),
					
				}}>
					<DataComponent {...stateValues} />
			</Bubble>)
		 : null

		setInfoView(view);

	}, [infoTarget, JSON.stringify(stateValues) ])
	
	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: "row", position: 'relative' }}>
			<Box sx={{ flex: 1, display: 'flex' }}>

				<HMICanvas
					id={program?.id || ''}
					nodes={program?.interface?.nodes || []}
					templatePacks={templatePacks}
					paths={program?.interface?.edges || []}
		
					deviceValues={stateValues}
					modes={[]}
					information={infoView}
					onBackdropClick={() => {

						// setSelected(undefined)
						setInfoTarget(undefined)
					}}
					onSelect={(select) => {
						let node = hmi?.nodes?.find((a: any) => a.id == select.id)
						const { x, y, width, height } = node || {x: 0, y: 0, width: 0, height: 0};


					}}
				/>
			</Box>

			{historize && <Paper sx={{display: 'flex', flexDirection: 'column', bottom: 6, right: 6, left: 6, position: 'absolute', overflow: 'hidden'}}>
				{/* <InfiniteScrubber 
					controls
					scale={'quarter-hour'}
					onTimeChange={(time) => {
						setTime(time)

						//TODO make onHorizonCHange
						const startDate = moment(time).toDate();
						const endDate = moment(startDate).add(1, 'week').toDate()
						// seekValue?.(startDate, endDate)
					}}
					time={time} /> */}
			</Paper>}

			
		</Box>
	)
}