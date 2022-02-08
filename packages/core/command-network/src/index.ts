import axios, { Axios, AxiosInstance } from 'axios';
import OPCUAServer from '@hive-command/opcua-server'
import { ArgumentOptions, DataType, StatusCode, StatusCodes, Variant } from 'node-opcua';
import { ActionPayload, AssignmentPayload, PayloadResponse } from './types';
import log from 'loglevel'

export * from './types'

export interface ValueBankInterface {
	getDeviceMode?: (device: string) => any;
	setDeviceMode?: (device: string, mode: boolean) => any;

	runOneshot?: (flowId: string) => void;
	stopOneshot?: (flowId: string) => void;
	isRunning?: (flowId: string) => boolean;

	requestState?: (device: string, key: string, value: any) => void;
	requestAction?: (device: string, action: string)=> void;
	get?: (device: string, key:string ) => any;
}
export interface CommandNetworkOptions{
	baseURL?: string;

	controller: {
		state?: {
			[key: string]: {
				type: DataType;
				get: () => Variant
				set?: (value: Variant) => StatusCode
			}
		}
		actions?: {
			[key: string]: {
				inputs: ArgumentOptions[]
				outputs: ArgumentOptions[]
				func: (args: Variant[]) => Promise<[Error | null, Variant[]]>
			}
		}
	},

	valueBank?: ValueBankInterface
}

export interface CommandBus {
	id: string;
	type: string;
	devices?: {ix: number, product: string, iodd: {
		function: {
			inputs: {name: string, struct: {name: string, bits: {subindex: string}}[]}[],
			outputs?: {name: string, struct: {name: string, bits: {subindex: string}}[]}[]
		}
	}}[]
}

export class CommandNetwork {

	private opc? : OPCUAServer

	private httpInstance : AxiosInstance;

	private identity? : string;


	private valueBank : ValueBankInterface = {}

	private options : CommandNetworkOptions;

	constructor(opts: CommandNetworkOptions){
		this.options = opts;

		this.httpInstance = axios.create({
			baseURL: opts.baseURL || 'http://discovery.hexhive.io:8080'
		})

		this.valueBank = {
			...opts.valueBank
		}
	}

	

	becomeSelf(self: {error?: any, identity?: any}){
		if(!self.error){
			this.identity = self.identity.named;
		}
	}

	getDataType = (type: string) => {
		switch(type){
			case 'BooleanT':
				return DataType.Boolean;
			case 'IntegerT':
			case 'UIntegerT':
				return DataType.Double;		
			default:
				return DataType.Double
		}
	}

	getDataValue = (type: string, value: any) => {
		let v = value //typeof(value) == "object" ? value[key] : value;
		switch(type){
			case 'BooleanT':
				return Boolean(v);
			case 'IntegerT':
			case 'UIntegerT':
			default:
				return	parseFloat(v);		
		}
	}

	getDeviceName = (type: string,  bus: string, port: any) => {
		return `${type}|${bus}|${port}`
	}

	request(variant: Variant){
		if(this.valueBank.requestAction){
			let parts = variant.value.toString().split('|')
			if(!parts) return;
			const [ device, action ] = parts;
			this.valueBank.requestAction(device, action)
		}
	}

	//Turn buses into OPC map
	async initOPC({layout, actions} : {layout: AssignmentPayload[], actions: ActionPayload[]}){

		// await this.opc?.setComandEndpoint(this.request.bind(this))
		
		// await this.opc?.addControllerInfo(`CommandAction`, DataType.String, () => {
		// 	return new Variant({dataType: DataType.String, value: "Action"})
		// })

		await Promise.all(actions.map(async (action) => {
			// this.opc./

			await this.opc?.addDevice({
				name: action.name,
				type: "PlantAction",
			}, {
				actions: {
					start: {
						inputs: [],
						outputs: [{name: 'success', dataType: DataType.Boolean}],
						func: async (args: Variant[]) => {
							const [ value ] = args;

							log.info(`Action ${action.name} started`)
							const result = this.valueBank?.runOneshot?.(action.id)

							return [new Variant({dataType: DataType.Boolean, value: true})]
						}
					},
					stop: {
						inputs: [],
						outputs: [{name: 'success', dataType: DataType.Boolean}],
						func: async (args: Variant[]) => {
							const [ value ] = args;

							log.info(`Action ${action.name} stopped`)
							const result = this.valueBank?.stopOneshot?.(action.id)

							return [new Variant({dataType: DataType.Boolean, value: true})]
						}
					}
				},
				state: {
					running: {
						type: DataType.Boolean,
						get: () => {
							const value = this.valueBank.isRunning?.(action.id)
							return new Variant({dataType: DataType.Boolean, value: value})
						}
					}
				}
			}, 'PlantActions')
			//TODO add action to OPC /Controller/Actions/Flow/Running
		}))

		await Promise.all(layout.map(async (layout) => {
			await this.opc?.addDevice({
				name: layout.name,
				type: layout.type
			}, {
				actions: {
					changeMode: {
						inputs: [{name: 'mode', dataType: DataType.String}],
						outputs: [{name: 'success', dataType: DataType.Boolean}],
						func: async (args: Variant[]) => {
							await this.valueBank.setDeviceMode?.(layout.name, args[0].toString() == "Automatic" ? true : false)
							return [new Variant({dataType: DataType.Boolean, value: true})];
						}
					}
				},
				state: {
					...(layout.state || []).reduce((prev, curr) => {
						let opcPoint: any = {
							...prev,
							[curr.key]: {
								type: this.getDataType(curr.type),
								get: () => {
									let value = this.valueBank.get?.(layout.name, curr.key);
									// log.info(`Get ${layout.name} ${curr.key} ${value}`)
									return new Variant({dataType: this.getDataType(curr.type), value: this.getDataValue(curr.type, value)})
								}
								
							}
						}

						if(curr.writable){
							opcPoint[curr.key].set = (variant: Variant) => {
								console.log("OPC POINT", variant)
								this.valueBank.requestState?.(layout.name, curr.key, variant.value)
								return StatusCodes.Good;
							}
						}
						return opcPoint
					}, {}),
					mode: {
						type: DataType.String,
						get: () => {

							return new Variant({dataType: DataType.String, value: this.valueBank.getDeviceMode?.(layout.name) ?  "Automatic" : "Manual"})
						}, 
						set: (variant: Variant) => {
							console.log(`Change mode for ${layout.name}`)
							this.valueBank.setDeviceMode?.(layout.name, variant.value.toString() == "Automatic" ? true : false)
							return StatusCodes.Good;
						}
					}
				},
			})
		}))

		
	}

	/*
		- Start OPCUA Server and Companions
		- Load initialState (decouples building the schema from running the server)
	*/
	async start(credentials: {
		hostname: string,
		discoveryServer?: string
	}, struct: {layout: AssignmentPayload[], actions: ActionPayload[]} ){

		this.opc = new OPCUAServer({
			productName: "CommandPilot",
            hostname: credentials.hostname,
			discoveryServer: credentials.discoveryServer,
			controller: this.options.controller || {},
		})


		await this.opc.start()
		await this.initOPC(struct);


	}

	async stop(){
		await this.opc?.stop()
	}
}