/*
	Controller 

	Handles all requests from the SyncClient.

	Provides an API to the SyncClient to access the data (OPCUA)

	SyncClient -> OPCUA -> Controller -> Machine
*/
import log from 'loglevel'

import { ActionPayload, AssignmentPayload, CommandNetwork, ValueBankInterface } from "@hive-command/network";
import { CommandStateMachineMode } from "@hive-command/state-machine";
import { DataType, StatusCodes, Variant } from "node-opcua";
import client, { Socket } from "socket.io-client";
import { Machine } from "../machine";
import e from 'express';

export class Controller {

	private network : CommandNetwork;
	private machine: Machine;
	private valueBank: ValueBankInterface;

	private healthCheck : Socket;

	private healthTimer?: NodeJS.Timeout

	constructor(opts: {
		commandCenter: string,
		machine: Machine,
		valueBank: ValueBankInterface
	}){

		this.valueBank = opts.valueBank;
		this.machine = opts.machine;

		this.network = new CommandNetwork({
			baseURL: opts.commandCenter, 
			valueBank: this.valueBank,
			controller: {
				state: {
					Running: {
						type: DataType.Boolean,
						get: () => {
							return new Variant({dataType: DataType.Boolean, value: this.machine.isProgramRunning || false})
						}
					},
					Mode: {
						type: DataType.String,
						get: () => {
							return new Variant({dataType: DataType.String, value: CommandStateMachineMode[this.machine.mode]})
						}
					}
				},
				actions: {
					start: {
						inputs: [

						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							}
						],
						func: async (inputs) => {
							log.debug('Controller:start')
							this.machine?.startProgram()
							return [null, [new Variant({dataType: DataType.Boolean, value: true})]];
						}
					},
					shutdown: {
						inputs: [
							
						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							}
						],
						func: async (inputs) => {
							log.debug('Controller:shutdown')

							this.machine?.stopProgram()
							return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
						}
					},
					standby: {
						inputs: [

						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							}
						],
						func: async (inputs) => {
							log.debug('Controller:standby')
							this.machine?.standby()
							return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
						}
					},
					// skipTo: {
					// 	inputs: [
					// 		{
					// 			name: 'process',
					// 			dataType: DataType.String
					// 		},
					// 	],
					// 	outputs: [
					// 		{
					// 			name: 'success',
					// 			dataType: DataType.Boolean
					// 		}
					// 	],
					// 	func: async (inputs) => {
					// 		const [value] = inputs;

					// 		console.log({value}, "skipTo")
						
					// 		// if(result) throw result;
					// 		return [result || null, [new Variant({dataType: DataType.Boolean, value: true})]]
					// 	}
					// },
					command: {
						inputs: [
							{
								name: 'device',
								dataType: DataType.String
							},
							{
								name: 'action',
								dataType: DataType.String
							}
						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							},
						],
						func: async (inputs) => {
							const [device, action] = inputs;

							console.log({device, action}, "Controller")
							const result = await this.valueBank.requestAction?.(device.value.toString(), action.value.toString())	
							return [result || null, [new Variant({dataType: DataType.Boolean, value: true})]];
						}
					},
					changeMode: {
						inputs: [
							{
								name: 'mode',
								dataType: DataType.String
							}
						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							}
						],
						func: async (inputs) => {
							const [ mode ] = inputs;

							const modeString = mode.value.toString().toUpperCase()
							let newMode = (CommandStateMachineMode as any)?.[modeString]
							if(newMode != undefined){
								log.info(`Changing machine mode to ${modeString}`)

								await this.machine?.changeMode(newMode)

								return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
							}else{
								log.error(`Invalid mode ${modeString}`)
								return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
							}
						}
					}
				}
			}
		});

		this.healthCheck = client(opts.commandCenter || 'ws://localhost:3000');

		this.setupHeartbeat();
	}

	async start(
		credentials: {
			hostname: string,
			discoveryServer: string
		}, 
		struct: {
			layout: AssignmentPayload[], 
			actions: ActionPayload[]
		}
	){
		await this.network.start(credentials, struct)
	}

	async stop(){
		if(this.healthTimer){
			clearTimeout(this.healthTimer)
		}
		await this.network.stop()
		await this.healthCheck.disconnect()
	}

	becomeSelf(self: any){
		this.network.becomeSelf(self)
	}


	async setupHeartbeat(){
		// await this.hearbeat();
		await this.liveHeartbeat();
	}

	async liveHeartbeat(){
		this.healthCheck.emit('identity:heartbeat')
		this.healthTimer = setTimeout(() => this.liveHeartbeat(), 5 * 1000)
	}

	// async hearbeat(){
	// 	if(!this.healthCheck) return;
		
	// 	await sendSMS(this.options.healthCheck?.number,  this.options.healthCheck?.message || 'Hive Command Client is running...', this.options.healthCheck?.username, this.options.healthCheck?.password)

	// 	setTimeout(() => this.hearbeat(), this.options.healthCheck.interval || 60 * 60 * 1000)
	// }
}