import gql from "graphql-tag";

export default gql`

extend type HiveOrganisation {
	commandDevices: [CommandDevice] @relationship(type: "HAS_COMMAND_DEVICE", direction: OUT)
}

type CommandDevice @auth(rules: [
	{operations: [READ, UPDATE], where: {organisation: {id: "$jwt.organisation"}}},
	{operations: [UPDATE], where: {organisation: {id: "$jwt.organisation"}}}
]) {
	id: ID! @id
	name: String

	activeProgram: CommandProgram @relationship(type: "RUNNING_PROGRAM", direction: OUT)

	network_name: String

	calibrations: [CommandProgramDeviceCalibration] @relationship(type: "HAS_CALIBRATION", direction: OUT)

	peripherals: [CommandDevicePeripheral] @relationship(type: "HAS_PERIPHERAL", direction: OUT)
	
	operatingMode: String
	operatingState: String

	waitingForActions: [CommandProgramAction] @relationship(type: "WAITING_FOR", direction: OUT)

	online: Boolean
	lastOnline: DateTime

	reporting: [CommandDeviceReport] @relationship(type: "HAS_REPORT", direction: OUT)

	organisation: HiveOrganisation @relationship(type: "HAS_COMMAND_DEVICE", direction: IN)
}

type CommandDeviceReport {
	id: ID! @id
	x: Int
	y: Int
	w: Int
	h: Int

	device: CommandDevice @relationship(type: "HAS_REPORT", direction: IN)
	templateDevice: CommandProgramDevicePlaceholder @relationship(type: "USES_PLACEHOLDER", direction: OUT)  
	templateKey: CommandProgramDeviceState @relationship(type: "USES_TEMPLATE_KEY", direction: OUT)
	total: Boolean
	type: String
}

type CommandDevicePeripheral {
	id: ID! @id
	name: String
	type: String
	
	ports: Int

	connectedDevices: [CommandDevicePeripheralProduct] @relationship(type: "IS_CONNECTED", direction: IN, properties: "CommandDevicePeripheralPort")
	mappedDevices: [CommandDevicePeripheralMap] @relationship(type: "HAS_MAPPING", direction: OUT, properties: "CommandDevicePeripheralPort")

	device: CommandDevice @relationship(type: "HAS_PERIPHERAL", direction: IN)
}

type CommandProgramDeviceCalibration {
	id: ID @id
	rootDevice: CommandDevice @relationship(type: "HAS_CALIBRATION", direction: IN)

	device: CommandProgramDevicePlaceholder @relationship(type: "USES_DEVICE", direction: OUT)
	deviceKey: CommandProgramDeviceState @relationship(type: "USES_STATE_ITEM", direction: OUT)

	min: String
	max: String
}

type CommandDevicePeripheralProduct {
	id:ID @id
	deviceId: String
	vendorId: String
	name: String

	peripheral: CommandDevicePeripheral @relationship(type: "IS_CONNECTED", direction: OUT, properties: "CommandDevicePeripheralPort")

	connections: [CommandPeripheralProductDatapoint] @relationship(type: "HAS_VARIABLE", direction: OUT)
}

type CommandPeripheralProductDatapoint {
	direction: String
	key: String
	type: String

	product: CommandDevicePeripheralProduct  @relationship(type: "HAS_VARIABLE", direction: IN)
}

type CommandDevicePeripheralMap {
	id: ID! @id
	key: CommandPeripheralProductDatapoint @relationship(type: "USES_VARIABLE", direction: OUT)
	device: CommandProgramDevicePlaceholder @relationship(type: "USES_DEVICE", direction: OUT)
	value: CommandProgramDeviceState @relationship(type: "USES_STATE", direction: OUT)
}

interface CommandDevicePeripheralPort @relationshipProperties {
	port: String
}

`