/*
	Controller 

	Handles all requests from the SyncClient.

	Provides an API to the SyncClient to access the data (OPCUA)

	SyncClient -> OPCUA -> Controller -> Machine
*/
import log from 'loglevel'

import { AssignmentPayload, CommandNetwork, ValueBankInterface } from "@hive-command/network";
import { CommandStateMachineMode } from "@hive-command/state-machine";
import { DataType, StatusCodes, Variant } from "node-opcua";
import client, { Socket } from "socket.io-client";
import { Machine } from "../machine";

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
							return new Variant({dataType: DataType.Boolean, value: this.machine?.isRunning || false})
						}
					},
					Mode: {
						type: DataType.String,
						get: () => {
							return new Variant({dataType: DataType.String, value: CommandStateMachineMode[this.machine?.mode || CommandStateMachineMode.DISABLED]})
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
							await this.machine?.start()
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

							await this.machine?.shutdown()
							return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
						}
					},
					skipTo: {
						inputs: [
							{
								name: 'process',
								dataType: DataType.String
							},
						],
						outputs: [
							{
								name: 'success',
								dataType: DataType.Boolean
							}
						],
						func: async (inputs) => {
							const [value] = inputs;
						
							const result = await this.machine?.runOneshot(value.value.toString())
							// if(result) throw result;
							return [result || null, [new Variant({dataType: DataType.Boolean, value: true})]]
						}
					},
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

							let newMode = (CommandStateMachineMode as any)[mode.value.toString().toUpperCase()]

							log.info(`Changing machine mode to ${newMode}`)
							
							await this.machine?.changeMode(newMode)

							return [null, [new Variant({dataType: DataType.Boolean, value: true})]]
						}
					}
				}

			}
		});

		this.healthCheck = client(opts.commandCenter || 'ws://localhost:3000');

		this.setupHeartbeat();
	}

	async start(credentials: {
		hostname: string,
		discoveryServer: string
	}, layout: AssignmentPayload[]){
		await this.network.start(credentials, layout)
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