import neo4j, { Driver, Session } from 'neo4j-driver'

export class HiveCommandData {
	private driver: Driver;

	private session: Session;

	constructor(){
		this.driver = neo4j.driver(
			process.env.NEO4J_URI || 'neo4j://localhost',
			neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASS || 'password')
		)

		this.session = this.driver.session();
		// this.session = this.driver.session()
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
		console.log("Update liveness")

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