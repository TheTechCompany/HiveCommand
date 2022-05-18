import { AssignmentPayload } from "@hive-command/data-types";
import PIDController from "node-pid-controller";

export class DeviceMap {
	private assignment: AssignmentPayload[];
	private modeSet : (AssignmentPayload & {mode: string})[];

	constructor(assignment?: AssignmentPayload[]){
		this.assignment = assignment = [];
		this.modeSet = (assignment.map((assignment) => ({...assignment, mode: "Automatic"})) || []);
	}

	public setAssignment(assignment: AssignmentPayload[]){
		this.assignment = assignment
		this.modeSet = (assignment.map((assignment) => ({...assignment, mode: (assignment as any).mode || "Automatic"})) || []);
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

			// console.log("PLugin init ", plugin.plugin?.name, pluginObject)
		}))
	}

	//Get device mode
	public getDeviceModeByName(name: string){
		return this.modeSet.find(assignment => assignment.name === name)?.mode
	}

	//Set device mode
	public setDeviceModeByName(name: string, mode: string){
		// console.log("SET BY NAME", this.modeSet, name, mode)
		let ix = this.modeSet.map((x) => x.name).indexOf(name);
		if(ix > -1){
			this.modeSet[ix].mode = mode
		}
	}

	public getDeviceByType(type: string){
		return this.assignment.filter(assignment => assignment.type === type)
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

	public getDevicesByBusPort(bus: string, port: string): AssignmentPayload[] {
		console.log({bus, port}, JSON.stringify(this.assignment))
		return this.assignment.filter(assignment => (assignment.state || []).map((x) => x.bus).indexOf(bus) > -1 && (assignment.state || []).map((x) => x.port).indexOf(port) > -1)
	}

	//Get assignment by bus and port
	public getDeviceByBusPort(bus: string, port: string): AssignmentPayload | undefined {
		return this.assignment.find(assignment => (assignment.state || []).map((x) => x.bus).indexOf(bus) > -1 && (assignment.state || []).map((x) => x.port).indexOf(port) > -1)
	}

	//Get assignment by device name
	public getDeviceBusPort(name: string, key?: string): any | undefined {
		let device = key ? this.assignment.find(assignment => assignment.name === name && (assignment.state || []).map((x) => x.key).indexOf(key) > -1) : this.assignment.find(assignment => assignment.name == name);
		const stateItem = key ? device?.state?.find((a) => a.key == key) || {} : device?.state?.find((a) => a.port && a.bus)

		return stateItem
	}
}