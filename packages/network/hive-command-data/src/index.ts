import neo4j, { Driver, Session } from 'neo4j-driver'

import {connect, disconnect} from 'mongoose';

import Device from './device';
import Program, {FlowShard} from './program';
import Stack from './stack'
import DNSRecord from './dns'
import DeviceValue from './device-value'

let opts : any = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

if(process.env.MONGO_USER){
    opts.user = process.env.MONGO_USER
}

if(process.env.MONGO_PASS){
    opts.pass = process.env.MONGO_PASS
}

if(process.env.MONGO_AUTH_DB){
    opts.authSource = process.env.MONGO_AUTH_DB
}

export const disconnect_data = async () => {
    return await disconnect()
}

export const connect_data = () => {
    return new Promise((resolve, reject) => {
    connect(
        `mongodb://${process.env.MONGO_URL || "localhost:27017"}/${process.env.MONGO_DB || "sudbuster-test"}`, 
        opts, (err) => {
            if(err) return reject(err);
            resolve(true);
        });
    })
}

export const Models = {
    Device,
    DeviceValue,
    FlowShard,
    Program,
    Stack,
    DNSRecord
}

export * as Types from './types'


export class HiveCommandData {
	private driver: Driver;

	private session: Session;

	constructor(){
		this.driver = neo4j.driver(
			process.env.NEO4J_URI || 'neo4j://localhost',
			neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASS || 'password')
		)

		this.session = this.driver.session();
	}

	async updateProcess(id: string, {process, target}: {process: string, target: string}){
		const session = this.driver.session()

		const result = await session.run(`
			MATCH (device:CommandDevice {network_name: $id})
			MERGE (device)-[:HAS_SNAPSHOT]->(snapshot:CommandDeviceSnapshot {process: $process})
			ON MATCH
				SET snapshot.target = $target
			ON CREATE
				SET snapshot.target = $target
			RETURN device, snapshot
		`, {
			id,
			process,
			target
		})
		await session.close()

	}

	async updateMode(network_name: string, mode: string){
		const session = this.driver.session()
		
		await session.writeTransaction(async (tx) => {
			await tx.run(`
				MATCH (device:CommandDevice {network_name: $network_name})
				SET device.operatingMode = $mode
				RETURN device
			`, {
				network_name: network_name,
				mode: mode
			})
		})

		await session.close()
	}

	async updateLiveness(id: string, live?: boolean){
		const session = this.driver.session()
		// console.log("Update liveness")

		const result = await session.run(`
				MATCH (device:CommandDevice {network_name: $id})
				SET device.online = $live
				SET device.lastOnline = datetime($snapshotTime)
				RETURN device 
			`, {
				id,
				snapshotTime: new Date().toISOString(),
				live: live || false
			})
		
		await session.close()
		return result;
	}
}