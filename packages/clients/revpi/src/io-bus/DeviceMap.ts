import { AssignmentPayload } from "@hive-command/network";
import PIDController from "node-pid-controller";

export class DeviceMap {
	private assignment: AssignmentPayload[];

	constructor(assignment?: AssignmentPayload[]){
		this.assignment = assignment = [];
	}

	public setAssignment(assignment: AssignmentPayload[]){
		this.assignment = assignment
	}

	//Init plugin by device id
	public async setupDevicePlugins(deviceId: string){
		const device = this.getDeviceById(deviceId)

		await Promise.all((device?.plugins || []).map(async (plugin, ix) => {

			let pluginObject = plugin.configuration.reduce<{
				p?: string,
				i?: string,
				d?: string,
				target?: string;
			}>((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

			const portIx = this.getDeviceIndexById(deviceId)

			if(portIx > -1){
				let plugins = this.assignment[portIx].plugins?.slice() || [];

				plugins[ix].instance = new PIDController({
					k_p: pluginObject.p ? parseFloat(pluginObject.p) : 0.5,
					k_i: pluginObject.i ? parseFloat(pluginObject.i) : 0.01,
					k_d: pluginObject.d ? parseFloat(pluginObject.d) : 0.01,
					dt: 0.5
				})

				plugins[ix].instance.setTarget(pluginObject.target ? parseFloat(pluginObject.target) : 0)

				this.assignment[portIx].plugins = plugins
			}

			console.log("PLugin init ", plugin.name, pluginObject)
		}))
	}

	//Get device index
	public getDeviceIndexById(id: string): number {
		return this.assignment.map((x) => x.id).indexOf(id);;
	}

	//Get devices with plugins
	public getDevicesWithPlugins(): AssignmentPayload[] {
		return this.assignment.filter(assignment => assignment.plugins !== undefined && assignment.plugins.length > 0);
	}

	//Get device name from assignment by bus and port
	public getDeviceName(bus: string, port: string): string | undefined {
		return this.getDeviceByBusPort(bus, port)?.name;
	}

	//Get device by id
	public getDeviceById(id: string): AssignmentPayload | undefined {
		return this.assignment.find((a) => a.id == id)
	}

	//Get assignment by bus and port
	public getDeviceByBusPort(bus: string, port: string): AssignmentPayload | undefined {
		return this.assignment.find(assignment => assignment.bus === bus && assignment.port === port)
	}

	//Get assignment by device name
	public getDeviceBusPort(name: string): AssignmentPayload | undefined {
		let device = this.assignment.find(assignment => assignment.name === name);
		return device
	}
}