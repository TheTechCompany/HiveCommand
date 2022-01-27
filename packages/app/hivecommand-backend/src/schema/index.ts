import { gql } from 'graphql-tag';
import devices from './devices';
import hmi from './hmi';
import program from './program';

export default gql`

	type Query {
		commandDeviceValue(device: String, bus : String, port : String): [CommandDeviceValue]
		commandDeviceTimeseries(deviceId: String, device: String, valueKey: String, startDate: String): [CommandDeviceTimeseriesData]
		commandDeviceTimeseriesTotal(deviceId: String, device: String, valueKey: String, startDate: String, endDate: String): CommandDeviceTimeseriesTotal
	}

	type Mutation {
		changeMode(deviceId: String, mode: String): Boolean
		changeState(deviceId: String, state: String): Boolean
		

		performDeviceAction(deviceId: String, deviceName: String, action: String): Boolean
		changeDeviceValue(deviceId: String, deviceName: String, key: String, value: String): Boolean
		
		changeDeviceMode(deviceId: String, deviceName: String, mode: String): Boolean
		requestFlow(deviceId: String, actionId: String): Boolean
	}

	type CommandDeviceTimeseriesTotal @exclude {
		total: Float
	}

	type CommandDeviceTimeseriesData @exclude {
		device: String
		deviceId: String 
		valueKey: String
		value: String
		timestamp: DateTime
	}

	type CommandDeviceValue @exclude{
		device: String
		deviceId: String
		value: String
		valueKey: String
	}


	type CommandKeyValue {
		id: ID @id
		key: String
		value: String
	}

${devices}


	type CommandInterlockAssertion {
		id: ID! @id
		type: String
		value: String
		setpoint: CommandDeviceSetpoint @relationship(type: "USES_SETPOINT", direction: OUT)
	}

	type CommandProgramDevicePlaceholder {
		id: ID! @id
		name: String
		type: CommandProgramDevice @relationship(type: "USES_TEMPLATE", direction: OUT)

		requiresMutex: Boolean

		interlocks: [CommandInterlock] @relationship(type: "HAS_INTERLOCK", direction: OUT)
		setpoints: [CommandDeviceSetpoint] @relationship(type: "HAS_SETPOINT", direction: OUT)
		plugins: [CommandDevicePlugin] @relationship(type: "HAS_PLUGIN", direction: OUT)

		program: CommandProgram @relationship(type: "USES_DEVICE", direction: IN)
	}

	type CommandDeviceSetpoint {
		id: ID! @id
		name: String
		key: CommandProgramDeviceState @relationship(type: "USES_STATE", direction: OUT)
		type: String
		value: String
	}

	type CommandDevicePlugin {
		id: ID! @id
		plugin: CommandProgramDevicePlugin @relationship(type: "USES_PLUGIN", direction: OUT)
		rules: CommandProgramFlow @relationship(type: "WHEN_FLOW", direction: OUT)
		configuration: [CommandKeyValue] @relationship(type: "USES_KV", direction: OUT)
	}


	interface CommandProgramDevicePluginAssignment @relationshipProperties {
		configuration: [String]
	}

	type CommandProgramDevicePlugin {
		id: ID! @id
		name: String
		compatibility: [CommandProgramDevicePluginCompatibility] @relationship(type: "USES_COMPATIBILITY", direction: OUT)
		config: [CommandProgramDevicePluginConfiguration] @relationship(type: "HAS_CONF", direction: OUT)
		tick: String
	}

	type CommandProgramDevicePluginCompatibility {
		id: ID! @id
		name: String
	}

	type CommandProgramDevicePluginConfiguration {
		id: ID! @id
		key: String
		type: String
		requires: [CommandProgramDevicePluginConfiguration] @relationship(type: "REQUIRES", direction: OUT, properties: "CommandProgramDevicePluginRequires")
		value: String
		plugin: CommandProgramDevicePlugin @relationship(type: "HAS_CONF", direction: IN)
	}

	interface CommandProgramDevicePluginRequires @relationshipProperties {
		key: String
	}

	type CommandProgramDevice {
		id: ID! @id
		name: String
		type: String

		usedIn: [CommandProgramDevicePlaceholder] @relationship(type: "USES_TEMPLATE", direction: IN)

		state: [CommandProgramDeviceState] @relationship(type: "HAS_STATE", direction: OUT)
		actions: [CommandProgramDeviceAction] @relationship(type: "HAS_ACTION", direction: OUT)
	}


	type CommandProgramDeviceAction {
		id: ID! @id
		key: String

		device: CommandProgramDevice @relationship(type: "HAS_ACTION", direction: IN)

	}

	type CommandProgramDeviceState {
		id: ID! @id
		key: String
		type: String
		
		inputUnits: String
		units: String
		
		writable: Boolean

		min: String
		max: String

		device: CommandProgramDevice @relationship(type: "HAS_STATE", direction: IN)
	}

	type CommandProgramDocumentation {
		id: ID! @id
		name: String
		blocks: [String]

		program: CommandProgram @relationship(type: "HAS_DOCS", direction: IN)
	}

	type CommandProgramFlow {
		id: ID! @id
		name: String
		parent: CommandProgramFlow @relationship(type: "HAS_SUBFLOW", direction: IN)
		children: [CommandProgramFlow] @relationship(type: "HAS_SUBFLOW", direction: OUT)

		nodes: [CommandProgramNode] @relationship(type: "USES_NODE", direction: OUT)
		conditions: [CommandProgramNodeFlowConfiguration] @relationship(type: "HAS_CONDITION", direction: OUT)
		programs: [CommandProgram] @relationship(type: "USES_FLOW", direction: IN)
	}

	type CommandActionItem {
		id: ID! @id
		device: CommandProgramDevicePlaceholder @relationship(type: "ACTIONS", direction: OUT)
		request: CommandProgramDeviceAction @relationship(type: "USES_ACTION", direction: OUT)
		release: Boolean
	}


	type CommandPlugin {
		id: ID! @id
		name: String
		items: [CommandPluginItem] @relationship(type: "HAS_PLUGIN_ITEM", direction: OUT)

	}

	type CommandPluginItem {
		id: ID! @id
		name: String
		type: String
		value: String

		usedIn: [CommandPlugin] @relationship(type: "HAS_PLUGIN_ITEM", direction: IN)
	}

	${program}
	${hmi}

`