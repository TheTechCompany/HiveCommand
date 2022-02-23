import Client from '@hive-command/opcua-client'
import { DiscoveryService } from '@hive-command/opcua-lds';
import async, { AsyncFunction, series } from 'async';
import { ApplicationDescription, DataType, ReferenceDescription, ServerOnNetwork, Variant } from 'node-opcua';
import os from 'os';
import { DiscoveryServer } from '..';
import { Models } from '@hive-command/data-types'
import { Pool, PoolClient } from "pg";
import { publishToILP } from '../data/ilp';

import net from "net"
import { Data } from '../data';

const { DeviceValue } = Models;

export class SyncClient {

	private clients : {[key: string]: Client} = {};

	private servers: {[key: string]: ApplicationDescription} = {};

	private discoveryInterval: any;

	private influxPool: Pool;
	
	private discoveryServer: DiscoveryService

	private influxClient? : PoolClient;

	private dataBroker: Data;

	private client = new net.Socket();

	constructor(opts: {discoveryServer: DiscoveryService, broker: Data}){
		// this.client = new Client(opts.discoveryServer)
		this.discoveryServer = opts.discoveryServer

		this.dataBroker = opts.broker;

		this.discover = this.discover.bind(this);

		this.influxPool = new Pool({
			// database: 'qdb',
			host: process.env.TIMESERIES_HOST,
			port: 5432,
			user: 'postgres',
			password: process.env.TIMESERIES_PASSWORD,
		})


		this.createLogEntry = this.createLogEntry.bind(this);
	}

	async discover(){
		const servers = this.discoveryServer.registeredServers
		// const findServersOnNetwork = await this.client.discoverOnNetwork()

		
		await Promise.all((servers || []).map(async (server) => {
			if(server.productUri?.toString() == "NodeOPCUA-Server"){
				// console.log("Server", JSON.stringify(server))

				
				let serverUrl = (server.discoveryUrls || []).length > 0 ? server.discoveryUrls?.[0]?.toString() : undefined
				if(!serverUrl) return;
				let serverUri = serverUrl;

				if(!this.clients[serverUri] && serverUrl){
					
					// console.log("new server ", serverUri, server)

					//Match networkName to device id 
					let networkName = serverUrl.match(/opc.tcp:\/\/(.+?).hexhive.io/)?.[1]

					if(!networkName) return console.error("Could not find network name for server", serverUrl)
					const controlDevice = await this.dataBroker.getDevice(networkName)

					//New server
					this.clients[serverUri] = new Client(`opc.tcp://discovery.hexhive.io:4840`)
					await this.clients[serverUri].connect(serverUrl)
				
					const devices = await this.clients[serverUri].browse(`/Objects/1:Devices`)

					const actions = await this.clients[serverUri].browse(`/Objects/1:Plant/1:Actions`)
					// console.log(devices);
					// console.log(`Connected to ${server.discoveryUrls?.[0]?.toString()}, found ${devices?.references?.length}`)

					let items = [];
					for(var i = 0; i < (devices?.references || []).length; i++){
						let ref = devices?.references?.[i];

						let path = `/Objects/1:Devices/${ref?.browseName.namespaceIndex}:${ref?.browseName.name}`
						const result = await this.clients[serverUri].browse(path)
						
	
						let item = {
							name: ref?.browseName.name?.toString(),
							items: result?.references?.map((x) => x.browseName.name?.toString())
						}
						items.push(item);
					}
			

						let plant_datapoints = [
							{
								path: `/Objects/1:Controller/1:Machine/1:Mode`,
								tag: "Plant-Mode"
							},
							{
								path: `/Objects/1:Controller/1:Machine/1:Running`,
								tag: "Plant-Running"
							}
						]
	
						let datapoints = items?.reduce<{path: string, tag: string}[]>((prev, curr) => {
							return prev.concat(curr?.items?.filter((a) => a !== "Product" && a !== "Serial").map((item) => ({
								path: `/Objects/1:Devices/1:${curr.name}/1:${item}`,
								tag: `${curr.name}-${item}`
							}) ) || [])
						}, [])

						let action_datapoints = (actions?.references || []).map((ref) => ({
							path: `/Objects/1:Plant/1:Actions/${ref.browseName.namespaceIndex}:${ref.browseName.name}/1:running`,
							tag: `PlantActions-${ref.browseName.name}`
						}))

						datapoints = [...datapoints, ...action_datapoints, ...plant_datapoints]

						// console.log("Subscribing to", datapoints.map((x) => x.tag))
	
						const monitor = await this.clients[serverUri].subscribeMulti(datapoints || [])
	
						monitor.monitors?.on('initialized', () => {
							console.log("Subscription initialized")
						})

						monitor.monitors?.on('changed', async (item, value, index) => {

							try{
								const key = monitor.unwrap(index)
								// console.log("CHANGED", key, index, value, value.value)
								await this.createLogEntry(controlDevice.id, key, value.value)
	
							}catch(e){
								console.log("Error during log creation", e)
							}
				
			
						})

					
				}

				this.servers[serverUri] = server;

			}
		}))

		// console.log("Found Servers", servers)
	}

	async start(){
		// this.client.connect(9009, process.env.INFLUX_HOST || 'localhost', () => {
			
		// })

		// this.client.on('error', () => {
		// 	console.log("Socket error in SyncClient");
		// 	this.client.connect(9009, process.env.INFLUX_HOST || 'localhost', () => {
			
		// 	})
		// })

		
		// await this.influxClient.connect()

		// await this.client.connect(`opc.tcp://${os.hostname()}:8440`)
		this.discoveryInterval = setInterval(async () => {
			await this.discover()
		}, 10 * 1000)
	}

	async write(serverUri: string, path: string, dataType: DataType, value: any){
		await this.clients?.[serverUri]?.setDetails(path, dataType, value)
	}

	async callMethod(serverUri: string, device: string, method: string, args: any[]){
		// console.log("Calling method", device, method, args)
		const result = await this.clients?.[serverUri]?.callMethod(device || `/Objects/1:Controller/1:Machine`, method || `/1:command`, args)
		// console.log(`Method called`, result)
	}
	// async writeAction(serverUri: string, deviceName: string, action: string, arg){
	// 	await this.callMethod(serverUri, deviceName, action)

	// 	// await this.write(serverUri, `/Objects/1:Controller/1:Machine/1:CommandPoint`, DataType.String, `${deviceName}|${action}`)
	// }


	async createLogEntry(device: string, key: string, value: Variant){
		// if(!this.influxClient){
		// 	this.influxClient = await this.influxPool.connect()
		// }

		console.log("Create log entry", key)

		// let parts = key.match(/(.+)\|(.+)\|(.+)/)
		// console.log("Parts", key, parts)
		// // console.log("Create log entry", key, value.value)
		// if(!parts) return;

		// let [fullKey, type, bus, portAndKey] = parts;

		let portParts = key.match(/(.+?)-(.+)/)

		if(!portParts) return;

		let [full, deviceId, valueKey] = portParts; 
		// let port = portAndKey.split('-')[0]
		// let valueKey = portAndKey.split('-')[1]

		if(value?.value?.toString() == "NaN" || value.value == NaN || value?.value?.toString() == '{"low":-100,"high":100}') return;

		// console.log("Key ", key, bus, port, valueKey, value.value)

		//OLD Hardcode for sudbustermk1
		// let device = 'd49bd954-51da-44ac-ab5a-1e9d0000e7ae'



		// let query = `(systimestamp(), $1, $2, $3, $4, $5)`
		// await client.query(
		// 	`INSERT INTO commandDeviceValue VALUES ${query}`,
		// 	[device, bus, port, value.value, valueKey]
		// )

		await Promise.all([
			publishToILP(	
				this.influxPool, 
				[{
					device,
					deviceId,
					value: value.value,
					valueKey
				}]
			),
			DeviceValue.updateOne({
				device,
				deviceId,
				valueKey
			}, {
				$set: {
					device: device,
					deviceId,
					value: value.value,
					valueKey: valueKey
				}
			}, {upsert: true})
		])

		// await client.query("COMMIT")

		// await client.release()

	}
}