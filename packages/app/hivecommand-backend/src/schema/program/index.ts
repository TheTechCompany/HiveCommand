import gql from "graphql-tag";

export default gql`

type CommandProgram {
	id: ID! @id
	name: String

	documentation: [CommandProgramDocumentation] @relationship(type: "HAS_DOCS", direction: OUT)
	program: [CommandProgramFlow] @relationship(type: "USES_FLOW", direction: OUT)
	hmi: [CommandProgramHMI] @relationship(type: "USES_HMI", direction: OUT)
	devices: [CommandProgramDevicePlaceholder] @relationship(type: "USES_DEVICE", direction: OUT)
	alarms: [CommandProgramAlarm] @relationship(type: "HAS_ALARM", direction: OUT)

	createdAt: DateTime @timestamp(operations: [CREATE])

	usedOn: CommandDevice @relationship(type: "RUNNING_PROGRAM", direction: IN)
}


type CommandProgramAction {
	id: ID! @id
	name: String
	flow: [CommandProgramFlow] @relationship(type: "USES_FLOW", direction: OUT)
}

type CommandProgramAlarm {
	id: ID! @id
	name: String
	trigger: String
}

type CommandInterlock {
	id: ID! @id
	inputDevice: CommandProgramDevicePlaceholder @relationship(type: "HAS_INPUT", direction: OUT)
	inputDeviceKey: CommandProgramDeviceState @relationship(type: "HAS_INPUT_KEY", direction: OUT)
	comparator: String

	assertion: CommandInterlockAssertion @relationship(type: "HAS_ASSERTION", direction: OUT)
	action: CommandProgramDeviceAction @relationship(type: "USE_SAFETY_ACTION", direction: OUT)

	device: CommandProgramDevicePlaceholder @relationship(type: "HAS_INTERLOCK", direction: IN)
}

type CommandProgramNodeConfiguration {
	id: ID! @id

	key: String
	value: String
} 

type CommandProgramNode {
	id: ID! @id
	x: Float
	y: Float
	type: String
	flow: [CommandProgramFlow] @relationship(type: "USES_NODE", direction: IN)

	actions: [CommandActionItem] @relationship(type: "HAS_ACTION", direction: OUT)
	subprocess: CommandProgramFlow @relationship(type: "USES_SUBFLOW", direction: OUT)

	configuration: [CommandProgramNodeConfiguration] @relationship(type: "HAS_CONF", direction: OUT)


	previous: [CommandProgramNode] @relationship(type: "USE_NEXT", direction: IN, properties: "CommandProgramNodeFlow")
	next: [CommandProgramNode] @relationship(type: "USE_NEXT", direction: OUT, properties: "CommandProgramNodeFlow")
}


type CommandProgramNodeFlowConfiguration {
	id: ID!
	inputDevice: CommandProgramDevicePlaceholder @relationship(type: "HAS_INPUT", direction: OUT)
	inputDeviceKey: CommandProgramDeviceState @relationship(type: "HAS_INPUT_KEY", direction: OUT)
	comparator: String
	assertion: String

	flow: CommandProgramFlow @relationship(type: "HAS_CONDITION", direction: IN)
}

interface CommandProgramNodeFlow @relationshipProperties {
	id: ID @id
	sourceHandle: String
	targetHandle: String

	conditions: [String]
	points: [CartesianPoint]
}

`