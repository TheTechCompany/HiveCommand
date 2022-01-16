import React, {useContext, useEffect, useMemo, useState} from 'react';
import { Box, CheckBox, TextInput } from 'grommet';
import QueryBuilder, {Field, formatQuery, RuleGroupType, RuleType} from 'react-querybuilder';
import { DeviceInterlockContext } from '../context';
import {Query, Builder, BasicConfig, Config, Utils as QbUtils, ImmutableTree} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';

import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
import 'react-awesome-query-builder/lib/css/styles.css';
import { FormInput } from '@hexhive/ui';
// import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles


const InitialConfig = AntdConfig; // or MaterialConfig or BasicConfig

const config : Config = {
	...InitialConfig,
	fields: {
	  qty: {
		  label: 'Qty',
		  type: 'number',
		  fieldSettings: {
			  min: 0,
		  },
		  valueSources: ['value'],
		  preferWidgets: ['number'],
	  },
	  price: {
		  label: 'Price',
		  type: 'number',
		  valueSources: ['value'],
		  fieldSettings: {
			  min: 10,
			  max: 100,
		  },
		  preferWidgets: ['slider', 'rangeslider'],
	  },
	  color: {
		  label: 'Color',
		  type: 'select',
		  valueSources: ['value'],
		  fieldSettings: {
			listValues: [
			  { value: 'yellow', title: 'Yellow' },
			  { value: 'green', title: 'Green' },
			  { value: 'orange', title: 'Orange' }
			],
		  }
	  },
	  is_promotion: {
		  label: 'Promo?',
		  type: 'boolean',
		  operators: ['equal'],
		  valueSources: ['value'],
	  },
	}
  };

  const queryValue = {"id": QbUtils.uuid(), type: "group"};


export const StateSection = (props) => {
	const { device, interlock, setInterlock } = useContext(DeviceInterlockContext)

	// const [ config, setConfig ] = useState<Config>({
	// 	...InitialConfig
	// });

	// const [ query, setQuery ] = useState<ImmutableTree>(QbUtils.checkTree(QbUtils.loadTree(interlock.state || {id: QbUtils.uuid(), type: 'group'}), config));

	const config = useMemo(() => {

		const stateFields = (device?.type?.state || []).reduce((prev, curr) => {
			return {
				...prev,
				[curr.key]: {
					label: curr.key,
					type: curr.type == "BooleanT" ? 'boolean' : 'number',
				  	valueSources: ['value'],
				}
			}
		}, {})

		return {
			...InitialConfig,
			fields: stateFields
		}
		// console.log("Config udpate")
	}, [device])

	// const query = useMemo(() => {
	// 	// if(interlock.state) {
	// 	// console.log("Update tree", interlock)
	// 	console.log({state: interlock.state})
	// 	let tree = interlock.state || {id: QbUtils.uuid(), type: 'group'}
	// 	console.log({tree})

	// 	const imTree = QbUtils.loadTree(tree)
	// 	console.log({imTree})

	// 	return QbUtils.checkTree(QbUtils.loadTree(tree), config)

	// 		// }
	// }, [interlock.state])
	console.log(device?.type)

	const changeState = (key: string, value: string) => {
		let oldState = interlock?.state?.slice()
		let ix = oldState.map((x) => x.deviceKey).indexOf(key)
		if(ix > -1){
			oldState[ix].deviceValue = value
		}else{
			oldState.push({deviceKey: key, deviceValue: value})
		}
		console.log({oldState})
		setInterlock({...interlock, state: oldState})
	}

	return (
		<Box flex gap="xsmall">
			{Object.keys(config?.fields)?.map((x) => config?.fields[x]).map((field) => field.type == 'number' ? (
				<FormInput 
					value={interlock.state?.find((a) => a.deviceKey == field.label)?.deviceValue}
					onChange={(value) => changeState(field.label, value)}
					placeholder={field?.label} 
					type={'number'}/>
			) : (
				<Box direction='row' align='center' justify='end'>
					<CheckBox 
						checked={interlock.state?.find((a) => a.deviceKey == field.label)?.deviceValue == "true"}
						onChange={(e) => changeState(field.label, `${e.target.checked}`)}
						reverse 
						label={field?.label} />
				</Box>
			))}
		</Box>
	)
}