import React, { useState } from 'react';
import { Box, Text, List, Button, Select } from 'grommet'
import { Info as CircleInformation, Security as ShieldSecurity, Power as Plug } from '@mui/icons-material';

import { Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { gql, useQuery as useApollo, useApolloClient } from '@apollo/client'
import { nanoid } from 'nanoid';
import { NamedTypeNode, ObjectTypeDefinitionNode } from 'graphql';

import { useCreatePlaceholderInterlock, useConfigureProgramPlaceholder, useCreatePlaceholderPlugin, useDeletePlaceholderInterlock, useCreatePlaceholderSetpoint, useUpdatePlaceholderInterlock, useUpdatePlaceholderSetpoint } from '@hive-command/api';
import { InfoSection } from './sections/Info';
import { PluginSection } from './sections/Plugins';
import { SafetySection } from './sections/Safety';
import { DeviceSingleProvider } from './context';

export interface DeviceSingleProps {
	program?: string;
}


const conditionGQL = gql`
type Transition {
	conditions: [Condition]
}

type Condition @exclude {
	inputDevice: Device @display(key:"name")
	inputDeviceKey: DeviceState @display(key:"key") @requires(key: "inputDevice")
	comparator: String @display
	assertion: String @display
}
`

export const DeviceSingle: React.FC<DeviceSingleProps> = (props) => {

	const client = useApolloClient();

	const navigate = useNavigate()

	const { id: deviceId } = useParams()

	const drawerMenu = [
		{
			label: "Info",
			route: '',
			icon: <CircleInformation />
		},
		{
			label: "Safety",
			route: 'safety',
			icon: <ShieldSecurity />
		},
		{
			label: "Plugins",
			route: 'plugins',
			icon: <Plug />
		}
	]



	// const selectPlugin = (plugin: any) => {
	// 	openModal(true);
	// 	setSelected(plugin)
	// }


	/*

			commandProgramDevicePlugins {
				id
				name
				config {
					key
					type

					requiresConnection {
						edges {
							key

							node {
								key
							}
						}
					}
				}
			}

			commandProgramDevicePlaceholders(where: {id: $id}){
				id
				name

				units {
					id
					
					inputUnit
					displayUnit
					state {
						id
					}
				}


				type {
					name
					actions {
						id
						key
					}

					state {
						id
						key
						type

						units
					}
				}

				setpoints {
					id
					name
					type
					key {
						id
						key
					}
					value
				}
				interlocks {
					id

					state {
						
						device {
							id
							name
						}

						deviceKey {
							id
							key
						}

						comparator
						assertion {
							value
						}

					}

					inputDevice {
						id 
						name
					}
					inputDeviceKey { 
						id
						key
					}

					action {
						id
					}

					comparator
					assertion {
						type
						value
						setpoint {
							id
							name
						}
					}
				}

				plugins {
					id
					plugin {
						id
						name
					}
					configuration {
						id
						key
						value
					}
					rules {
						id
						name
					}
				}
			

			}
	*/

	const { data } = useApollo(gql`
		query Q ($id: ID!, $programId: ID) {
			
			commandProgramDevicePlugins {
				id
				name
				config {
					key
					type

					order

					requires {
						id

						key
						type
					}
				}
			}

			commandPrograms(where: {id: $programId}){
				
				variables {
					id
					name
				}

				devices(where: {id: $id}) {
					id
					name

				
					type {
						state {
							id 
							key
							type
						}

						actions {
							id
							key
						}
					}

					plugins {
						id

						plugin {
							id
							name
						}

						rules {
							id
						}

						config {
							id
						}

					}

					setpoints {
						id
						name
						type
						key {
							id
							key
						}
						value
					}
					interlocks {
						id
	
						state {
							
							device {
								id
								name
							}
	
							deviceKey {
								id
								key
							}
	
							comparator
							assertion {
								value
							}
	
						}
	
						inputDevice {
							id 
							name
						}
						inputDeviceKey { 
							id
							key
						}
	
						action {
							id
						}
	
						comparator
						assertion {
							type
							value
							setpoint {
								id
								name
							}
							variable {
								id
								name
							}
						}
					}
				}

				program {
					id
					name
					children {
						id
						name
					}
				}
			}

			
		}
	`, {
		variables: {
			id: deviceId,
			programId: props.program
		}
	})

	const refetch = () => {
		return client.refetchQueries({ include: ['Q'] })
	}

	console.log({data})

	const device = data?.commandPrograms?.[0]?.devices?.[0];

	const flows = data?.commandPrograms?.[0]?.program?.map((item) => [item, ...(item.children || []).map((x) => ({ ...x, name: `${item.name} - ${x.name}` }))]).reduce((prev, curr) => prev.concat(curr), [])
	const devices = data?.commandPrograms?.[0]?.devices;
	const variables = data?.commandPrograms?.[0]?.variables;
	const plugins = data?.commandProgramDevicePlugins || [];

	return (

		<DeviceSingleProvider value={{
			device,
			deviceId,
			programId: props.program,
			devices,
			variables,
			plugins,
			flows,
			refetch
		}}>
			<Box direction={'row'} flex background={"#dfdfdf"}>
				<Box elevation='small'>
					{drawerMenu.map((item) => (
						<Box>
							<Button 
								onClick={() => navigate(item.route)}
								hoverIndicator 
								icon={item.icon} />
						</Box>
					))}
				</Box>

				<Box pad="xsmall" flex gap="xsmall" direction="column">
					<Box direction="row" justify="between" align="center" pad="xsmall">
						<Box>
							<Text size="medium">{device?.name}</Text>
							<Text size="small">{device?.type?.name}</Text>
						</Box>
					</Box>
					<Box flex>

						<Routes>
							<Route path={''} element={<Outlet />}>
								<Route path={''} element={<InfoSection />} />
								<Route path={'safety'} element={<SafetySection />} />
								<Route path={'plugins'} element={<PluginSection />} />
							</Route>
						</Routes>
					</Box>

				</Box>


			</Box>
		</DeviceSingleProvider>
	)
}