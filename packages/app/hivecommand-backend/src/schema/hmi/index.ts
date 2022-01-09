import gql from "graphql-tag";

export default gql`


type CommandProgramHMI {
	id: ID! @id
	name: String

	actions: [CommandProgramAction] @relationship(type: "HAS_ACTION", direction: OUT)

	paths: [CommandHMIPath] @relationship(type: "USES_PATH", direction: OUT)
	groups: [CommandHMIGroup] @relationship(type: "USES_GROUP", direction: OUT)
	nodes: [CommandHMINode] @relationship(type: "USES_NODE", direction: OUT)
	programs: [CommandProgram] @relationship(type: "USES_HMI", direction: IN)
}


union CommandHMINodes = CommandHMINode | CommandHMIGroup

type CommandHMIGroup {
	id: ID! @id
	x: Float
	y: Float

	width: Float
	height: Float

	rotation: Float
	scaleX: Float
	scaleY: Float

	nodes: [CommandHMINode] @relationship(type: "USES_NODE", direction: OUT)
	ports: [CommandHMIPort] @relationship(type: "HAS_PORT", direction: OUT)

	inputs: [CommandHMINode] @relationship(type: "USE_NEXT", direction: IN, properties: "CommandHMINodeFlow")
	outputs: [CommandHMINode] @relationship(type: "USE_NEXT", direction: OUT, properties: "CommandHMINodeFlow")
}

type CommandHMIPort {
	id: ID! @id
	key: String
	x: Float
	y: Float
	length: Float
	rotation: Float
}

type CommandHMINode {
	id: ID! @id
	x: Float
	y: Float

	rotation: Float
	scaleX: Float
	scaleY: Float

	z: Int

	showTotalizer : Boolean
	
	type: CommandHMIDevice @relationship(type: "USES_VISUAL", direction: OUT)

	devicePlaceholder: CommandProgramDevicePlaceholder @relationship(type: "REPRESENTS", direction: OUT)

	flow: [CommandProgramHMI] @relationship(type: "USES_NODE", direction: IN)

	inputs: [CommandHMINode] @relationship(type: "USE_NEXT", direction: IN, properties: "CommandHMINodeFlow")
	outputs: [CommandHMINode] @relationship(type: "USE_NEXT", direction: OUT, properties: "CommandHMINodeFlow")
}

type CommandHMIPath {
	id: ID! @id
	points: [CartesianPoint]
	source: CommandHMINodes @relationship(type: "HAS_SOURCE", direction: OUT)
	sourceHandle: String
	target: CommandHMINodes @relationship(type: "HAS_TARGET", direction: OUT)
	targetHandle: String
}


interface CommandHMINodeFlow @relationshipProperties {
	id: ID @id
	sourceHandle: String
	targetHandle: String
	points: [CartesianPoint]
}


type CommandHMIDevice {
	id: ID! @id
	name: String

	width: Float
	height: Float

	ports: [CommandHMIDevicePort] @relationship(type: "HAS_PORT", direction: OUT)
}

type CommandHMIDevicePort {
	id: ID! @id
	x: Float
	y: Float
	key: String
	rotation: Float
}

`