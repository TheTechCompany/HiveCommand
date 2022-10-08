/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { SchemaUnionsKey } from "gqty";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string;
  Hash: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
}

export interface ComandProgramInterfaceEdgeInput {
  from?: InputMaybe<Scalars["String"]>;
  fromHandle?: InputMaybe<Scalars["String"]>;
  fromPoint?: InputMaybe<Scalars["JSON"]>;
  points?: InputMaybe<Array<InputMaybe<PointInput>>>;
  to?: InputMaybe<Scalars["String"]>;
  toHandle?: InputMaybe<Scalars["String"]>;
  toPoint?: InputMaybe<Scalars["JSON"]>;
}

export interface ComandProgramInterfaceGroupInput {
  nodes?: InputMaybe<Array<InputMaybe<ComandProgramInterfaceNodeInput>>>;
  ports?: InputMaybe<Array<InputMaybe<CommandHMIPortInput>>>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
}

export interface ComandProgramInterfaceNodeInput {
  children?: InputMaybe<Array<InputMaybe<ComandProgramInterfaceNodeInput>>>;
  devicePlaceholder?: InputMaybe<Scalars["String"]>;
  height?: InputMaybe<Scalars["Float"]>;
  id?: InputMaybe<Scalars["String"]>;
  options?: InputMaybe<Scalars["JSONObject"]>;
  ports?: InputMaybe<Array<InputMaybe<CommandHMIPortInput>>>;
  rotation?: InputMaybe<Scalars["Float"]>;
  showTotalizer?: InputMaybe<Scalars["Boolean"]>;
  type?: InputMaybe<Scalars["String"]>;
  width?: InputMaybe<Scalars["Float"]>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
  z?: InputMaybe<Scalars["Int"]>;
}

export interface CommandAssertionInput {
  setpoint?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
  variable?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceInput {
  deviceSnapshot?: InputMaybe<Array<InputMaybe<CommandDeviceSnapshotInput>>>;
  name?: InputMaybe<Scalars["String"]>;
  network_name?: InputMaybe<Scalars["String"]>;
  peripherals?: InputMaybe<Array<InputMaybe<CommandDevicePeripheralInput>>>;
  program?: InputMaybe<Scalars["String"]>;
}

export interface CommandDevicePeripheralInput {
  connectedDevices?: InputMaybe<
    Array<InputMaybe<CommandPeripheralProductInput>>
  >;
  id?: InputMaybe<Scalars["String"]>;
  mappedDevices?: InputMaybe<Array<InputMaybe<PeripheralMapInput>>>;
  name?: InputMaybe<Scalars["String"]>;
  ports?: InputMaybe<Scalars["Int"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandDevicePluginConfigurationInput {
  id?: InputMaybe<Scalars["ID"]>;
  key?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
}

export interface CommandDevicePluginInput {
  config?: InputMaybe<Array<InputMaybe<CommandDevicePluginConfigurationInput>>>;
  plugin?: InputMaybe<Scalars["String"]>;
  rules?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceReportInput {
  dataDevice?: InputMaybe<Scalars["String"]>;
  dataKey?: InputMaybe<Scalars["String"]>;
  device?: InputMaybe<Scalars["String"]>;
  height?: InputMaybe<Scalars["Int"]>;
  id?: InputMaybe<Scalars["ID"]>;
  total?: InputMaybe<Scalars["Boolean"]>;
  type?: InputMaybe<Scalars["String"]>;
  width?: InputMaybe<Scalars["Int"]>;
  x?: InputMaybe<Scalars["Int"]>;
  y?: InputMaybe<Scalars["Int"]>;
}

export interface CommandDeviceSnapshotInput {
  key?: InputMaybe<Scalars["String"]>;
  placeholder?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceWhere {
  id?: InputMaybe<Scalars["ID"]>;
  network_name?: InputMaybe<Scalars["String"]>;
}

export interface CommandHMIDeviceInput {
  height?: InputMaybe<Scalars["Float"]>;
  name?: InputMaybe<Scalars["String"]>;
  ports?: InputMaybe<Array<InputMaybe<CommandHMIDevicePortInput>>>;
  width?: InputMaybe<Scalars["Float"]>;
}

export interface CommandHMIDevicePackInput {
  description?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  provider?: InputMaybe<Scalars["String"]>;
  public?: InputMaybe<Scalars["Boolean"]>;
  url?: InputMaybe<Scalars["String"]>;
}

export interface CommandHMIDevicePortInput {
  key?: InputMaybe<Scalars["String"]>;
  rotation?: InputMaybe<Scalars["Float"]>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
}

export interface CommandHMIPortInput {
  id?: InputMaybe<Scalars["String"]>;
  key?: InputMaybe<Scalars["String"]>;
  length?: InputMaybe<Scalars["Float"]>;
  rotation?: InputMaybe<Scalars["Float"]>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
}

export interface CommandPeripheralDatapointInput {
  direction?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["String"]>;
  key?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandPeripheralProductInput {
  connections?: InputMaybe<Array<InputMaybe<CommandPeripheralDatapointInput>>>;
  deviceId?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  port?: InputMaybe<Scalars["String"]>;
  vendorId?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDataDeviceInterlockInput {
  assertion?: InputMaybe<CommandAssertionInput>;
  comparator?: InputMaybe<Scalars["String"]>;
  deviceKey?: InputMaybe<Scalars["String"]>;
  inputDevice?: InputMaybe<Scalars["String"]>;
  inputDeviceKey?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceCalibrationInput {
  max?: InputMaybe<Scalars["String"]>;
  min?: InputMaybe<Scalars["String"]>;
  placeholder?: InputMaybe<Scalars["String"]>;
  stateItem?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceInput {
  name?: InputMaybe<Scalars["String"]>;
  template?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceInterlockInput {
  action?: InputMaybe<Scalars["String"]>;
  assertion?: InputMaybe<CommandAssertionInput>;
  comparator?: InputMaybe<Scalars["String"]>;
  inputDevice?: InputMaybe<Scalars["String"]>;
  inputDeviceKey?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceSetpointInput {
  key?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandProgramFlowEdgeConditionInput {
  assertion?: InputMaybe<CommandAssertionInput>;
  comparator?: InputMaybe<Scalars["String"]>;
  inputDevice?: InputMaybe<Scalars["ID"]>;
  inputDeviceKey?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramFlowEdgeInput {
  from?: InputMaybe<Scalars["ID"]>;
  fromHandle?: InputMaybe<Scalars["String"]>;
  points?: InputMaybe<Array<InputMaybe<PointInput>>>;
  to?: InputMaybe<Scalars["ID"]>;
  toHandle?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramFlowInput {
  name?: InputMaybe<Scalars["String"]>;
  parent?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramFlowNodeActionInput {
  device?: InputMaybe<Scalars["ID"]>;
  id?: InputMaybe<Scalars["ID"]>;
  request?: InputMaybe<Scalars["ID"]>;
}

export interface CommandProgramFlowNodeInput {
  subprocess?: InputMaybe<Scalars["String"]>;
  timer?: InputMaybe<Scalars["String"]>;
  timerUnit?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
}

export interface CommandProgramFlowWhere {
  id?: InputMaybe<Scalars["ID"]>;
  program?: InputMaybe<Scalars["ID"]>;
}

export interface CommandProgramInput {
  name?: InputMaybe<Scalars["String"]>;
  templatePacks?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
}

export interface CommandProgramInterfaceInput {
  localHomepage?: InputMaybe<Scalars["Boolean"]>;
  name?: InputMaybe<Scalars["String"]>;
  remoteHomepage?: InputMaybe<Scalars["Boolean"]>;
}

export interface CommandProgramVariableInput {
  defaultValue?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandReportPageInput {
  name?: InputMaybe<Scalars["String"]>;
}

export interface DeviceScreenInput {
  developer?: InputMaybe<Scalars["Boolean"]>;
  name?: InputMaybe<Scalars["String"]>;
}

export interface MaintenanceWindowInput {
  endTime?: InputMaybe<Scalars["DateTime"]>;
  startTime?: InputMaybe<Scalars["DateTime"]>;
}

export interface PeripheralMapInput {
  device?: InputMaybe<Scalars["String"]>;
  key?: InputMaybe<Scalars["String"]>;
  port?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
}

export interface PointInput {
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
}

export const scalarsEnumsHash: import("gqty").ScalarsEnumsHash = {
  Boolean: true,
  Date: true,
  DateTime: true,
  Float: true,
  Hash: true,
  ID: true,
  Int: true,
  JSON: true,
  JSONObject: true,
  String: true,
};
export const generatedSchema = {
  ComandProgramInterfaceEdgeInput: {
    from: { __type: "String" },
    fromHandle: { __type: "String" },
    fromPoint: { __type: "JSON" },
    points: { __type: "[PointInput]" },
    to: { __type: "String" },
    toHandle: { __type: "String" },
    toPoint: { __type: "JSON" },
  },
  ComandProgramInterfaceGroupInput: {
    nodes: { __type: "[ComandProgramInterfaceNodeInput]" },
    ports: { __type: "[CommandHMIPortInput]" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  ComandProgramInterfaceNodeInput: {
    children: { __type: "[ComandProgramInterfaceNodeInput]" },
    devicePlaceholder: { __type: "String" },
    height: { __type: "Float" },
    id: { __type: "String" },
    options: { __type: "JSONObject" },
    ports: { __type: "[CommandHMIPortInput]" },
    rotation: { __type: "Float" },
    showTotalizer: { __type: "Boolean" },
    type: { __type: "String" },
    width: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
    z: { __type: "Int" },
  },
  CommandActionItem: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    id: { __type: "ID!" },
    release: { __type: "Boolean" },
    request: { __type: "CommandProgramDeviceAction" },
  },
  CommandAssertion: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    setpoint: { __type: "CommandDeviceSetpoint" },
    type: { __type: "String" },
    value: { __type: "String" },
    variable: { __type: "CommandProgramVariable" },
  },
  CommandAssertionInput: {
    setpoint: { __type: "String" },
    type: { __type: "String" },
    value: { __type: "String" },
    variable: { __type: "String" },
  },
  CommandDataInterlock: {
    __typename: { __type: "String!" },
    assertion: { __type: "CommandAssertion" },
    comparator: { __type: "String" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    deviceKey: { __type: "CommandProgramDeviceState" },
    id: { __type: "ID!" },
    inputDevice: { __type: "CommandProgramDevicePlaceholder" },
    inputDeviceKey: { __type: "CommandProgramDeviceState" },
  },
  CommandDevice: {
    __typename: { __type: "String!" },
    activeProgram: { __type: "CommandProgram" },
    alarms: { __type: "[DeviceAlarm]" },
    calibrations: { __type: "[CommandProgramDeviceCalibration]" },
    dataLayout: { __type: "[DataLayout]" },
    deviceSnapshot: { __type: "[CommandDeviceSnapshot]" },
    id: { __type: "ID!" },
    lastSeen: { __type: "DateTime" },
    maintenanceWindows: { __type: "[MaintenanceWindow]" },
    name: { __type: "String" },
    network_name: { __type: "String" },
    online: { __type: "Boolean" },
    operatingMode: { __type: "String" },
    operatingState: { __type: "String" },
    organisation: { __type: "HiveOrganisation" },
    peripherals: { __type: "[CommandDevicePeripheral]" },
    reports: { __type: "[CommandReportPage]" },
    setpoints: { __type: "[CommandDeviceSetpointCalibration]" },
    waitingForActions: { __type: "[CommandProgramAction]" },
    watching: { __type: "[HiveUser]" },
  },
  CommandDeviceInput: {
    deviceSnapshot: { __type: "[CommandDeviceSnapshotInput]" },
    name: { __type: "String" },
    network_name: { __type: "String" },
    peripherals: { __type: "[CommandDevicePeripheralInput]" },
    program: { __type: "String" },
  },
  CommandDevicePeripheral: {
    __typename: { __type: "String!" },
    connectedDevices: { __type: "[CommandDevicePeripheralProduct]" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID!" },
    mappedDevices: { __type: "[CommandDevicePeripheralMap]" },
    name: { __type: "String" },
    ports: { __type: "Int" },
    type: { __type: "String" },
  },
  CommandDevicePeripheralInput: {
    connectedDevices: { __type: "[CommandPeripheralProductInput]" },
    id: { __type: "String" },
    mappedDevices: { __type: "[PeripheralMapInput]" },
    name: { __type: "String" },
    ports: { __type: "Int" },
    type: { __type: "String" },
  },
  CommandDevicePeripheralMap: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    id: { __type: "ID!" },
    key: { __type: "CommandPeripheralProductDatapoint" },
    port: { __type: "String" },
    value: { __type: "CommandProgramDeviceState" },
  },
  CommandDevicePeripheralPort: {
    __typename: { __type: "String!" },
    port: { __type: "String" },
  },
  CommandDevicePeripheralProduct: {
    __typename: { __type: "String!" },
    connections: { __type: "[CommandPeripheralProductDatapoint]" },
    deviceId: { __type: "String" },
    id: { __type: "ID" },
    name: { __type: "String" },
    peripheral: { __type: "CommandDevicePeripheral" },
    port: { __type: "String" },
    vendorId: { __type: "String" },
  },
  CommandDevicePlugin: {
    __typename: { __type: "String!" },
    config: { __type: "[CommandDevicePluginConfiguration]" },
    id: { __type: "ID!" },
    plugin: { __type: "CommandProgramDevicePlugin" },
    rules: { __type: "CommandProgramFlow" },
  },
  CommandDevicePluginConfiguration: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    key: { __type: "CommandProgramDevicePluginConfiguration" },
    value: { __type: "String" },
  },
  CommandDevicePluginConfigurationInput: {
    id: { __type: "ID" },
    key: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDevicePluginInput: {
    config: { __type: "[CommandDevicePluginConfigurationInput]" },
    plugin: { __type: "String" },
    rules: { __type: "String" },
  },
  CommandDeviceReport: {
    __typename: { __type: "String!" },
    dataDevice: { __type: "CommandProgramDevicePlaceholder" },
    dataKey: { __type: "CommandProgramDeviceState" },
    device: { __type: "CommandDevice" },
    height: { __type: "Int" },
    id: { __type: "ID!" },
    total: { __type: "Boolean" },
    totalValue: {
      __type: "CommandDeviceTimeseriesTotal",
      __args: { startDate: "DateTime" },
    },
    type: { __type: "String" },
    values: {
      __type: "[CommandDeviceTimeseriesData]",
      __args: { startDate: "DateTime" },
    },
    width: { __type: "Int" },
    x: { __type: "Int" },
    y: { __type: "Int" },
  },
  CommandDeviceReportInput: {
    dataDevice: { __type: "String" },
    dataKey: { __type: "String" },
    device: { __type: "String" },
    height: { __type: "Int" },
    id: { __type: "ID" },
    total: { __type: "Boolean" },
    type: { __type: "String" },
    width: { __type: "Int" },
    x: { __type: "Int" },
    y: { __type: "Int" },
  },
  CommandDeviceScreen: {
    __typename: { __type: "String!" },
    createdAt: { __type: "DateTime" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    name: { __type: "String" },
    provisionCode: { __type: "String" },
  },
  CommandDeviceSetpoint: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevice" },
    id: { __type: "ID!" },
    key: { __type: "CommandProgramDeviceState" },
    name: { __type: "String" },
    type: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDeviceSetpointCalibration: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    setpoint: { __type: "CommandDeviceSetpoint" },
    value: { __type: "String" },
  },
  CommandDeviceSnapshot: {
    __typename: { __type: "String!" },
    key: { __type: "String" },
    placeholder: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDeviceSnapshotInput: {
    key: { __type: "String" },
    placeholder: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDeviceTimeseriesData: {
    __typename: { __type: "String!" },
    device: { __type: "String" },
    deviceId: { __type: "String" },
    timestamp: { __type: "DateTime" },
    value: { __type: "String" },
    valueKey: { __type: "String" },
  },
  CommandDeviceTimeseriesTotal: {
    __typename: { __type: "String!" },
    total: { __type: "Float" },
  },
  CommandDeviceValue: {
    __typename: { __type: "String!" },
    device: { __type: "String" },
    deviceId: { __type: "String" },
    value: { __type: "String" },
    valueKey: { __type: "String" },
  },
  CommandDeviceWhere: {
    id: { __type: "ID" },
    network_name: { __type: "String" },
  },
  CommandHMIDevice: {
    __typename: { __type: "String!" },
    height: { __type: "Float" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    ports: { __type: "[CommandHMIDevicePort]" },
    width: { __type: "Float" },
  },
  CommandHMIDeviceInput: {
    height: { __type: "Float" },
    name: { __type: "String" },
    ports: { __type: "[CommandHMIDevicePortInput]" },
    width: { __type: "Float" },
  },
  CommandHMIDevicePack: {
    __typename: { __type: "String!" },
    description: { __type: "String" },
    elements: { __type: "[CommandHMIDevice]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    provider: { __type: "String" },
    public: { __type: "Boolean" },
    url: { __type: "String" },
  },
  CommandHMIDevicePackInput: {
    description: { __type: "String" },
    name: { __type: "String" },
    provider: { __type: "String" },
    public: { __type: "Boolean" },
    url: { __type: "String" },
  },
  CommandHMIDevicePort: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    key: { __type: "String" },
    rotation: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandHMIDevicePortInput: {
    key: { __type: "String" },
    rotation: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandHMIEdge: {
    __typename: { __type: "String!" },
    from: { __type: "CommandHMINode" },
    fromHandle: { __type: "String" },
    fromPoint: { __type: "JSON" },
    id: { __type: "ID!" },
    points: { __type: "[Point]" },
    to: { __type: "CommandHMINode" },
    toHandle: { __type: "String" },
    toPoint: { __type: "JSON" },
  },
  CommandHMIGroup: {
    __typename: { __type: "String!" },
    height: { __type: "Float" },
    id: { __type: "ID!" },
    inputs: { __type: "[CommandHMINode]" },
    nodes: { __type: "[CommandHMINode]" },
    outputs: { __type: "[CommandHMINode]" },
    ports: { __type: "[CommandHMIPort]" },
    rotation: { __type: "Float" },
    width: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandHMINode: {
    __typename: { __type: "String!" },
    children: { __type: "[CommandHMINode]" },
    devicePlaceholder: { __type: "CommandProgramDevicePlaceholder" },
    flow: { __type: "[CommandProgramHMI]" },
    height: { __type: "Float" },
    id: { __type: "ID!" },
    inputs: { __type: "[CommandHMINode]" },
    options: { __type: "JSONObject" },
    outputs: { __type: "[CommandHMINode]" },
    ports: { __type: "[CommandHMIPort]" },
    rotation: { __type: "Float" },
    showTotalizer: { __type: "Boolean" },
    type: { __type: "String" },
    width: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
    z: { __type: "Int" },
  },
  CommandHMINodeFlow: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    sourceHandle: { __type: "String" },
    targetHandle: { __type: "String" },
  },
  CommandHMINodes: {
    __typename: { __type: "String!" },
    $on: { __type: "$CommandHMINodes!" },
  },
  CommandHMIPort: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    key: { __type: "String" },
    length: { __type: "Float" },
    rotation: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandHMIPortInput: {
    id: { __type: "String" },
    key: { __type: "String" },
    length: { __type: "Float" },
    rotation: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandInterlock: {
    __typename: { __type: "String!" },
    action: { __type: "CommandProgramDeviceAction" },
    assertion: { __type: "CommandAssertion" },
    comparator: { __type: "String" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    id: { __type: "ID!" },
    inputDevice: { __type: "CommandProgramDevicePlaceholder" },
    inputDeviceKey: { __type: "CommandProgramDeviceState" },
    state: { __type: "[CommandInterlockState]" },
  },
  CommandInterlockState: {
    __typename: { __type: "String!" },
    assertion: { __type: "CommandAssertion" },
    comparator: { __type: "String" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    deviceKey: { __type: "CommandProgramDeviceState" },
    id: { __type: "ID!" },
    interlock: { __type: "CommandInterlock" },
  },
  CommandKeyValue: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    key: { __type: "String" },
    value: { __type: "String" },
  },
  CommandPeripheralDatapointInput: {
    direction: { __type: "String" },
    id: { __type: "String" },
    key: { __type: "String" },
    type: { __type: "String" },
  },
  CommandPeripheralProductDatapoint: {
    __typename: { __type: "String!" },
    direction: { __type: "String" },
    id: { __type: "ID" },
    key: { __type: "String" },
    product: { __type: "CommandDevicePeripheralProduct" },
    type: { __type: "String" },
  },
  CommandPeripheralProductInput: {
    connections: { __type: "[CommandPeripheralDatapointInput]" },
    deviceId: { __type: "String" },
    id: { __type: "String" },
    name: { __type: "String" },
    port: { __type: "String" },
    vendorId: { __type: "String" },
  },
  CommandProgram: {
    __typename: { __type: "String!" },
    alarms: { __type: "[CommandProgramAlarm]" },
    createdAt: { __type: "DateTime" },
    devices: {
      __type: "[CommandProgramDevicePlaceholder]",
      __args: { where: "CommandProgramDeviceWhere" },
    },
    id: { __type: "ID!" },
    interface: { __type: "[CommandProgramHMI]" },
    localHomepage: { __type: "CommandProgramHMI" },
    name: { __type: "String" },
    organisation: { __type: "HiveOrganisation" },
    program: { __type: "[CommandProgramFlow]" },
    remoteHomepage: { __type: "CommandProgramHMI" },
    templatePacks: { __type: "[CommandHMIDevicePack]" },
    usedOn: { __type: "CommandDevice" },
    variables: { __type: "[CommandProgramVariable]" },
  },
  CommandProgramAction: {
    __typename: { __type: "String!" },
    flow: { __type: "[CommandProgramFlow]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
  },
  CommandProgramAlarm: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    trigger: { __type: "String" },
  },
  CommandProgramDataDeviceInterlockInput: {
    assertion: { __type: "CommandAssertionInput" },
    comparator: { __type: "String" },
    deviceKey: { __type: "String" },
    inputDevice: { __type: "String" },
    inputDeviceKey: { __type: "String" },
  },
  CommandProgramDevice: {
    __typename: { __type: "String!" },
    actions: { __type: "[CommandProgramDeviceAction]" },
    config: { __type: "[CommandProgramDeviceConfiguration]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    state: { __type: "[CommandProgramDeviceState]" },
    type: { __type: "String" },
    usedIn: { __type: "[CommandProgramDevicePlaceholder]" },
  },
  CommandProgramDeviceAction: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevice" },
    func: { __type: "String" },
    id: { __type: "ID!" },
    key: { __type: "String" },
  },
  CommandProgramDeviceCalibration: {
    __typename: { __type: "String!" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    max: { __type: "String" },
    min: { __type: "String" },
    placeholder: { __type: "CommandProgramDevicePlaceholder" },
    stateItem: { __type: "CommandProgramDeviceState" },
  },
  CommandProgramDeviceCalibrationInput: {
    max: { __type: "String" },
    min: { __type: "String" },
    placeholder: { __type: "String" },
    stateItem: { __type: "String" },
  },
  CommandProgramDeviceConfiguration: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    key: { __type: "String" },
    type: { __type: "String" },
  },
  CommandProgramDeviceInput: {
    name: { __type: "String" },
    template: { __type: "String" },
  },
  CommandProgramDeviceInterlockInput: {
    action: { __type: "String" },
    assertion: { __type: "CommandAssertionInput" },
    comparator: { __type: "String" },
    inputDevice: { __type: "String" },
    inputDeviceKey: { __type: "String" },
  },
  CommandProgramDevicePlaceholder: {
    __typename: { __type: "String!" },
    dataInterlocks: { __type: "[CommandDataInterlock]" },
    id: { __type: "ID!" },
    interlocks: { __type: "[CommandInterlock]" },
    name: { __type: "String" },
    plugins: { __type: "[CommandDevicePlugin]" },
    program: { __type: "CommandProgram" },
    requiresMutex: { __type: "Boolean" },
    setpoints: { __type: "[CommandDeviceSetpoint]" },
    type: { __type: "CommandProgramDevice" },
    units: { __type: "[CommandProgramDeviceUnit]" },
  },
  CommandProgramDevicePlugin: {
    __typename: { __type: "String!" },
    compatibility: { __type: "[CommandProgramDevicePluginCompatibility]" },
    config: { __type: "[CommandProgramDevicePluginConfiguration]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    tick: { __type: "String" },
  },
  CommandProgramDevicePluginCompatibility: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    name: { __type: "String" },
  },
  CommandProgramDevicePluginConfiguration: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    key: { __type: "String" },
    order: { __type: "Int" },
    plugin: { __type: "CommandProgramDevicePlugin" },
    requires: { __type: "[CommandProgramDevicePluginConfiguration]" },
    type: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgramDeviceSetpointInput: {
    key: { __type: "String" },
    name: { __type: "String" },
    type: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgramDeviceState: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevice" },
    id: { __type: "ID!" },
    inputUnits: { __type: "String" },
    key: { __type: "String" },
    max: { __type: "String" },
    min: { __type: "String" },
    type: { __type: "String" },
    units: { __type: "String" },
    writable: { __type: "Boolean" },
  },
  CommandProgramDeviceUnit: {
    __typename: { __type: "String!" },
    device: { __type: "CommandProgramDevicePlaceholder" },
    displayUnit: { __type: "String" },
    id: { __type: "ID!" },
    inputUnit: { __type: "String" },
    state: { __type: "CommandProgramDeviceState" },
  },
  CommandProgramDeviceWhere: { id: { __type: "ID" } },
  CommandProgramEdge: {
    __typename: { __type: "String!" },
    conditions: { __type: "[CommandProgramEdgeCondition]" },
    from: { __type: "CommandProgramNode" },
    fromHandle: { __type: "String" },
    id: { __type: "ID!" },
    points: { __type: "[Point]" },
    to: { __type: "CommandProgramNode" },
    toHandle: { __type: "String" },
  },
  CommandProgramEdgeCondition: {
    __typename: { __type: "String!" },
    assertion: { __type: "CommandAssertion" },
    comparator: { __type: "String" },
    flow: { __type: "CommandProgramFlow" },
    id: { __type: "ID!" },
    inputDevice: { __type: "CommandProgramDevicePlaceholder" },
    inputDeviceKey: { __type: "CommandProgramDeviceState" },
  },
  CommandProgramFlow: {
    __typename: { __type: "String!" },
    children: { __type: "[CommandProgramFlow]" },
    edges: { __type: "[CommandProgramEdge]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    nodes: { __type: "[CommandProgramNode]" },
    parent: { __type: "CommandProgramFlow" },
    program: { __type: "CommandProgram" },
  },
  CommandProgramFlowEdgeConditionInput: {
    assertion: { __type: "CommandAssertionInput" },
    comparator: { __type: "String" },
    inputDevice: { __type: "ID" },
    inputDeviceKey: { __type: "String" },
  },
  CommandProgramFlowEdgeInput: {
    from: { __type: "ID" },
    fromHandle: { __type: "String" },
    points: { __type: "[PointInput]" },
    to: { __type: "ID" },
    toHandle: { __type: "String" },
  },
  CommandProgramFlowInput: {
    name: { __type: "String" },
    parent: { __type: "String" },
  },
  CommandProgramFlowNodeActionInput: {
    device: { __type: "ID" },
    id: { __type: "ID" },
    request: { __type: "ID" },
  },
  CommandProgramFlowNodeInput: {
    subprocess: { __type: "String" },
    timer: { __type: "String" },
    timerUnit: { __type: "String" },
    type: { __type: "String" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandProgramFlowWhere: { id: { __type: "ID" }, program: { __type: "ID" } },
  CommandProgramHMI: {
    __typename: { __type: "String!" },
    actions: { __type: "[CommandProgramAction]" },
    edges: { __type: "[CommandHMIEdge]" },
    id: { __type: "ID" },
    localHomepage: { __type: "Boolean" },
    name: { __type: "String" },
    nodes: { __type: "[CommandHMINode]" },
    programs: { __type: "[CommandProgram]" },
    remoteHomepage: { __type: "Boolean" },
  },
  CommandProgramInput: {
    name: { __type: "String" },
    templatePacks: { __type: "[String]" },
  },
  CommandProgramInterfaceInput: {
    localHomepage: { __type: "Boolean" },
    name: { __type: "String" },
    remoteHomepage: { __type: "Boolean" },
  },
  CommandProgramNode: {
    __typename: { __type: "String!" },
    actions: { __type: "[CommandActionItem]" },
    configuration: { __type: "[CommandProgramNodeConfiguration]" },
    flow: { __type: "[CommandProgramFlow]" },
    id: { __type: "ID!" },
    inputs: { __type: "[CommandProgramNode]" },
    outputs: { __type: "[CommandProgramNode]" },
    subprocess: { __type: "CommandProgramFlow" },
    timer: { __type: "CommandProgramNodeTimer" },
    type: { __type: "String" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  CommandProgramNodeConfiguration: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    key: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgramNodeFlowConfiguration: {
    __typename: { __type: "String!" },
    assertion: { __type: "String" },
    comparator: { __type: "String" },
    flow: { __type: "CommandProgramFlow" },
    id: { __type: "ID!" },
    inputDevice: { __type: "CommandProgramDevicePlaceholder" },
    inputDeviceKey: { __type: "CommandProgramDeviceState" },
  },
  CommandProgramNodeTimer: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    unit: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgramVariable: {
    __typename: { __type: "String!" },
    defaultValue: { __type: "String" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    program: { __type: "CommandProgram" },
    type: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgramVariableInput: {
    defaultValue: { __type: "String" },
    name: { __type: "String" },
    type: { __type: "String" },
  },
  CommandProgramWhere: { id: { __type: "ID" } },
  CommandReportPage: {
    __typename: { __type: "String!" },
    createdAt: { __type: "DateTime" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    name: { __type: "String" },
    reports: { __type: "[CommandDeviceReport]" },
  },
  CommandReportPageInput: { name: { __type: "String" } },
  DataLayout: {
    __typename: { __type: "String!" },
    children: { __type: "[DataLayout]" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    label: { __type: "String" },
    parent: { __type: "DataLayout" },
    type: { __type: "String" },
  },
  DeviceAlarm: {
    __typename: { __type: "String!" },
    cause: { __type: "String" },
    createdAt: { __type: "DateTime" },
    id: { __type: "ID" },
    message: { __type: "String" },
  },
  DeviceScreenInput: {
    developer: { __type: "Boolean" },
    name: { __type: "String" },
  },
  HiveOrganisation: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
  },
  HiveUser: { __typename: { __type: "String!" }, id: { __type: "ID!" } },
  MaintenanceWindow: {
    __typename: { __type: "String!" },
    device: { __type: "CommandDevice" },
    endTime: { __type: "DateTime" },
    id: { __type: "ID" },
    owner: { __type: "String" },
    startTime: { __type: "DateTime" },
  },
  MaintenanceWindowInput: {
    endTime: { __type: "DateTime" },
    startTime: { __type: "DateTime" },
  },
  PeripheralMapInput: {
    device: { __type: "String" },
    key: { __type: "String" },
    port: { __type: "String" },
    value: { __type: "String" },
  },
  Point: {
    __typename: { __type: "String!" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  PointInput: { x: { __type: "Float" }, y: { __type: "Float" } },
  mutation: {
    __typename: { __type: "String!" },
    changeDeviceMode: {
      __type: "Boolean",
      __args: { deviceId: "String", deviceName: "String", mode: "String" },
    },
    changeDeviceValue: {
      __type: "Boolean",
      __args: {
        deviceId: "String",
        deviceName: "String",
        key: "String",
        value: "String",
      },
    },
    changeMode: {
      __type: "Boolean",
      __args: { deviceId: "String", mode: "String" },
    },
    changeState: {
      __type: "Boolean",
      __args: { deviceId: "String", state: "String" },
    },
    createCommandDevice: {
      __type: "CommandDevice!",
      __args: { input: "CommandDeviceInput!" },
    },
    createCommandDeviceCalibration: {
      __type: "CommandProgramDeviceCalibration",
      __args: { device: "ID!", input: "CommandProgramDeviceCalibrationInput" },
    },
    createCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", input: "MaintenanceWindowInput!" },
    },
    createCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { input: "CommandDeviceReportInput", page: "ID" },
    },
    createCommandInterfaceDevice: {
      __type: "CommandHMIDevice",
      __args: { input: "CommandHMIDeviceInput", pack: "ID" },
    },
    createCommandInterfacePack: {
      __type: "CommandHMIDevicePack",
      __args: { input: "CommandHMIDevicePackInput" },
    },
    createCommandProgram: {
      __type: "CommandProgram!",
      __args: { input: "CommandProgramInput!" },
    },
    createCommandProgramDataDeviceInterlock: {
      __type: "CommandDataInterlock!",
      __args: {
        device: "ID!",
        input: "CommandProgramDataDeviceInterlockInput!",
        program: "ID!",
      },
    },
    createCommandProgramDevice: {
      __type: "CommandProgramDevicePlaceholder!",
      __args: { input: "CommandProgramDeviceInput!", program: "ID!" },
    },
    createCommandProgramDeviceInterlock: {
      __type: "CommandInterlock!",
      __args: {
        device: "ID!",
        input: "CommandProgramDeviceInterlockInput!",
        program: "ID!",
      },
    },
    createCommandProgramDevicePlugin: {
      __type: "CommandDevicePlugin!",
      __args: {
        device: "ID!",
        input: "CommandDevicePluginInput!",
        program: "ID!",
      },
    },
    createCommandProgramDeviceSetpoint: {
      __type: "CommandDeviceSetpoint!",
      __args: {
        device: "ID!",
        input: "CommandProgramDeviceSetpointInput!",
        program: "ID!",
      },
    },
    createCommandProgramFlow: {
      __type: "CommandProgramFlow!",
      __args: { input: "CommandProgramFlowInput!", program: "ID" },
    },
    createCommandProgramFlowEdge: {
      __type: "CommandProgramEdge!",
      __args: {
        flow: "ID",
        input: "CommandProgramFlowEdgeInput!",
        program: "ID",
      },
    },
    createCommandProgramFlowEdgeCondition: {
      __type: "CommandProgramEdgeCondition!",
      __args: {
        edge: "ID",
        flow: "ID",
        input: "CommandProgramFlowEdgeConditionInput!",
        program: "ID",
      },
    },
    createCommandProgramFlowNode: {
      __type: "CommandProgramNode!",
      __args: {
        flow: "ID",
        input: "CommandProgramFlowNodeInput!",
        program: "ID",
      },
    },
    createCommandProgramFlowNodeAction: {
      __type: "CommandActionItem!",
      __args: {
        flow: "ID",
        input: "CommandProgramFlowNodeActionInput!",
        node: "ID",
        program: "ID",
      },
    },
    createCommandProgramInterface: {
      __type: "CommandProgramHMI",
      __args: { input: "CommandProgramInterfaceInput!", program: "ID" },
    },
    createCommandProgramInterfaceEdge: {
      __type: "CommandHMIEdge",
      __args: {
        hmi: "ID",
        input: "ComandProgramInterfaceEdgeInput!",
        program: "ID",
      },
    },
    createCommandProgramInterfaceGroup: {
      __type: "CommandHMIGroup",
      __args: {
        input: "ComandProgramInterfaceGroupInput!",
        node: "ID",
        program: "ID",
      },
    },
    createCommandProgramInterfaceNode: {
      __type: "CommandHMINode",
      __args: {
        hmi: "ID",
        input: "ComandProgramInterfaceNodeInput!",
        program: "ID",
      },
    },
    createCommandProgramVariable: {
      __type: "CommandProgramVariable!",
      __args: { input: "CommandProgramVariableInput!", program: "ID!" },
    },
    createCommandReportPage: {
      __type: "CommandReportPage!",
      __args: { device: "ID", input: "CommandReportPageInput!" },
    },
    createDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", input: "DeviceScreenInput!" },
    },
    deleteCommandDevice: {
      __type: "CommandDevice!",
      __args: { where: "CommandDeviceWhere!" },
    },
    deleteCommandDeviceCalibration: {
      __type: "CommandProgramDeviceCalibration",
      __args: { device: "ID!", id: "ID!" },
    },
    deleteCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", id: "ID!" },
    },
    deleteCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { id: "ID", page: "ID" },
    },
    deleteCommandInterfaceDevice: {
      __type: "CommandHMIDevice",
      __args: { id: "ID!", pack: "ID" },
    },
    deleteCommandInterfacePack: {
      __type: "CommandHMIDevicePack",
      __args: { id: "ID!" },
    },
    deleteCommandProgram: { __type: "Boolean!", __args: { id: "ID!" } },
    deleteCommandProgramDataDeviceInterlock: {
      __type: "Boolean!",
      __args: { device: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramDevice: {
      __type: "Boolean!",
      __args: { id: "ID!", program: "ID!" },
    },
    deleteCommandProgramDeviceInterlock: {
      __type: "Boolean!",
      __args: { device: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramDevicePlugin: {
      __type: "Boolean!",
      __args: { device: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramDeviceSetpoint: {
      __type: "Boolean!",
      __args: { device: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramFlow: {
      __type: "Boolean!",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramFlowEdge: {
      __type: "Boolean!",
      __args: { flow: "ID", id: "ID!", program: "ID" },
    },
    deleteCommandProgramFlowEdgeCondition: {
      __type: "Boolean!",
      __args: { edge: "ID", flow: "ID", id: "ID!", program: "ID" },
    },
    deleteCommandProgramFlowNode: {
      __type: "Boolean!",
      __args: { flow: "ID", id: "ID!", program: "ID" },
    },
    deleteCommandProgramFlowNodeAction: {
      __type: "Boolean!",
      __args: { flow: "ID", id: "ID!", node: "ID", program: "ID" },
    },
    deleteCommandProgramInterface: {
      __type: "CommandProgramHMI",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramInterfaceEdge: {
      __type: "CommandHMIEdge",
      __args: { hmi: "ID", id: "ID!", program: "ID" },
    },
    deleteCommandProgramInterfaceGroup: {
      __type: "CommandHMIGroup",
      __args: { id: "ID!", node: "ID", program: "ID" },
    },
    deleteCommandProgramInterfaceNode: {
      __type: "CommandHMINode",
      __args: { hmi: "ID", id: "ID!", program: "ID" },
    },
    deleteCommandProgramVariable: {
      __type: "CommandProgramVariable!",
      __args: { id: "ID!", program: "ID!" },
    },
    deleteCommandReportPage: {
      __type: "CommandReportPage!",
      __args: { device: "ID", id: "ID" },
    },
    deleteDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", id: "ID!" },
    },
    performDeviceAction: {
      __type: "Boolean",
      __args: { action: "String", deviceId: "String", deviceName: "String" },
    },
    requestFlow: {
      __type: "Boolean",
      __args: { actionId: "String", deviceId: "String" },
    },
    updateCommandDevice: {
      __type: "CommandDevice!",
      __args: { input: "CommandDeviceInput!", where: "CommandDeviceWhere!" },
    },
    updateCommandDeviceCalibration: {
      __type: "CommandProgramDeviceCalibration",
      __args: {
        device: "ID!",
        id: "ID!",
        input: "CommandProgramDeviceCalibrationInput",
      },
    },
    updateCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", id: "ID!", input: "MaintenanceWindowInput!" },
    },
    updateCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { id: "ID", input: "CommandDeviceReportInput", page: "ID" },
    },
    updateCommandDeviceReportGrid: {
      __type: "[CommandDeviceReport]",
      __args: { device: "ID", grid: "[CommandDeviceReportInput]", page: "ID" },
    },
    updateCommandDeviceSetpoint: {
      __type: "String",
      __args: { device: "ID!", setpoint: "ID!", value: "String" },
    },
    updateCommandDeviceUptime: {
      __type: "CommandDevice!",
      __args: { uptime: "DateTime", where: "CommandDeviceWhere!" },
    },
    updateCommandInterfaceDevice: {
      __type: "CommandHMIDevice",
      __args: { id: "ID!", input: "CommandHMIDeviceInput", pack: "ID" },
    },
    updateCommandInterfacePack: {
      __type: "CommandHMIDevicePack",
      __args: { id: "ID!", input: "CommandHMIDevicePackInput" },
    },
    updateCommandProgram: {
      __type: "CommandProgram!",
      __args: { id: "ID!", input: "CommandProgramInput!" },
    },
    updateCommandProgramDataDeviceInterlock: {
      __type: "CommandDataInterlock!",
      __args: {
        device: "ID!",
        id: "ID!",
        input: "CommandProgramDataDeviceInterlockInput!",
        program: "ID!",
      },
    },
    updateCommandProgramDevice: {
      __type: "CommandProgramDevicePlaceholder!",
      __args: {
        id: "ID!",
        input: "CommandProgramDeviceInput!",
        program: "ID!",
      },
    },
    updateCommandProgramDeviceInterlock: {
      __type: "CommandInterlock!",
      __args: {
        device: "ID!",
        id: "ID!",
        input: "CommandProgramDeviceInterlockInput!",
        program: "ID!",
      },
    },
    updateCommandProgramDevicePlugin: {
      __type: "CommandDevicePlugin!",
      __args: {
        device: "ID!",
        id: "ID!",
        input: "CommandDevicePluginInput!",
        program: "ID!",
      },
    },
    updateCommandProgramDeviceSetpoint: {
      __type: "CommandDeviceSetpoint!",
      __args: {
        device: "ID!",
        id: "ID!",
        input: "CommandProgramDeviceSetpointInput!",
        program: "ID!",
      },
    },
    updateCommandProgramFlow: {
      __type: "CommandProgramFlow!",
      __args: { id: "ID!", input: "CommandProgramFlowInput!", program: "ID" },
    },
    updateCommandProgramFlowEdge: {
      __type: "CommandProgramEdge!",
      __args: {
        flow: "ID",
        id: "ID!",
        input: "CommandProgramFlowEdgeInput!",
        program: "ID",
      },
    },
    updateCommandProgramFlowEdgeCondition: {
      __type: "CommandProgramEdgeCondition!",
      __args: {
        edge: "ID",
        flow: "ID",
        id: "ID!",
        input: "CommandProgramFlowEdgeConditionInput!",
        program: "ID",
      },
    },
    updateCommandProgramFlowNode: {
      __type: "CommandProgramNode!",
      __args: {
        flow: "ID",
        id: "ID!",
        input: "CommandProgramFlowNodeInput!",
        program: "ID",
      },
    },
    updateCommandProgramFlowNodeAction: {
      __type: "CommandActionItem!",
      __args: {
        flow: "ID",
        id: "ID",
        input: "CommandProgramFlowNodeActionInput!",
        node: "ID",
        program: "ID",
      },
    },
    updateCommandProgramInterface: {
      __type: "CommandProgramHMI",
      __args: {
        id: "ID!",
        input: "CommandProgramInterfaceInput!",
        program: "ID",
      },
    },
    updateCommandProgramInterfaceEdge: {
      __type: "CommandHMIEdge",
      __args: {
        hmi: "ID",
        id: "ID",
        input: "ComandProgramInterfaceEdgeInput!",
        program: "ID",
      },
    },
    updateCommandProgramInterfaceGroup: {
      __type: "CommandHMIGroup",
      __args: {
        id: "ID",
        input: "ComandProgramInterfaceGroupInput!",
        node: "ID",
        program: "ID",
      },
    },
    updateCommandProgramInterfaceNode: {
      __type: "CommandHMINode",
      __args: {
        hmi: "ID",
        id: "ID",
        input: "ComandProgramInterfaceNodeInput!",
        program: "ID",
      },
    },
    updateCommandProgramVariable: {
      __type: "CommandProgramVariable!",
      __args: {
        id: "ID!",
        input: "CommandProgramVariableInput!",
        program: "ID!",
      },
    },
    updateCommandReportPage: {
      __type: "CommandReportPage!",
      __args: { device: "ID", id: "ID", input: "CommandReportPageInput!" },
    },
    updateDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", id: "ID!", input: "DeviceScreenInput!" },
    },
  },
  query: {
    __typename: { __type: "String!" },
    _sdl: { __type: "String!" },
    commandDeviceTimeseries: {
      __type: "[CommandDeviceTimeseriesData]",
      __args: {
        device: "String",
        deviceId: "String",
        startDate: "String",
        valueKey: "String",
      },
    },
    commandDeviceTimeseriesTotal: {
      __type: "CommandDeviceTimeseriesTotal",
      __args: {
        device: "String",
        deviceId: "String",
        endDate: "String",
        startDate: "String",
        valueKey: "String",
      },
    },
    commandDeviceValue: {
      __type: "[CommandDeviceValue]",
      __args: { bus: "String", device: "String", port: "String" },
    },
    commandDevices: {
      __type: "[CommandDevice]!",
      __args: { where: "CommandDeviceWhere" },
    },
    commandInterfaceDevicePacks: {
      __type: "[CommandHMIDevicePack]",
      __args: { id: "ID", registered: "Boolean" },
    },
    commandInterfaceDevices: { __type: "[CommandHMIDevice!]!" },
    commandProgramDevicePlugins: { __type: "[CommandProgramDevicePlugin]!" },
    commandProgramDevices: { __type: "[CommandProgramDevice]!" },
    commandProgramFlows: {
      __type: "[CommandProgramFlow]!",
      __args: { where: "CommandProgramFlowWhere" },
    },
    commandPrograms: {
      __type: "[CommandProgram]!",
      __args: { where: "CommandProgramWhere" },
    },
    hash: { __type: "Hash", __args: { input: "String!" } },
  },
  subscription: {
    __typename: { __type: "String!" },
    watchingDevice: { __type: "[HiveUser]", __args: { device: "ID!" } },
  },
  [SchemaUnionsKey]: { CommandHMINodes: ["CommandHMIGroup", "CommandHMINode"] },
} as const;

export interface CommandActionItem {
  __typename?: "CommandActionItem";
  device?: Maybe<CommandProgramDevicePlaceholder>;
  id: ScalarsEnums["ID"];
  release?: Maybe<ScalarsEnums["Boolean"]>;
  request?: Maybe<CommandProgramDeviceAction>;
}

export interface CommandAssertion {
  __typename?: "CommandAssertion";
  id: ScalarsEnums["ID"];
  setpoint?: Maybe<CommandDeviceSetpoint>;
  type?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
  variable?: Maybe<CommandProgramVariable>;
}

export interface CommandDataInterlock {
  __typename?: "CommandDataInterlock";
  assertion?: Maybe<CommandAssertion>;
  comparator?: Maybe<ScalarsEnums["String"]>;
  device?: Maybe<CommandProgramDevicePlaceholder>;
  deviceKey?: Maybe<CommandProgramDeviceState>;
  id: ScalarsEnums["ID"];
  inputDevice?: Maybe<CommandProgramDevicePlaceholder>;
  inputDeviceKey?: Maybe<CommandProgramDeviceState>;
}

export interface CommandDevice {
  __typename?: "CommandDevice";
  activeProgram?: Maybe<CommandProgram>;
  alarms?: Maybe<Array<Maybe<DeviceAlarm>>>;
  calibrations?: Maybe<Array<Maybe<CommandProgramDeviceCalibration>>>;
  dataLayout?: Maybe<Array<Maybe<DataLayout>>>;
  deviceSnapshot?: Maybe<Array<Maybe<CommandDeviceSnapshot>>>;
  id: ScalarsEnums["ID"];
  lastSeen?: Maybe<ScalarsEnums["DateTime"]>;
  maintenanceWindows?: Maybe<Array<Maybe<MaintenanceWindow>>>;
  name?: Maybe<ScalarsEnums["String"]>;
  network_name?: Maybe<ScalarsEnums["String"]>;
  online?: Maybe<ScalarsEnums["Boolean"]>;
  operatingMode?: Maybe<ScalarsEnums["String"]>;
  operatingState?: Maybe<ScalarsEnums["String"]>;
  organisation?: Maybe<HiveOrganisation>;
  peripherals?: Maybe<Array<Maybe<CommandDevicePeripheral>>>;
  reports?: Maybe<Array<Maybe<CommandReportPage>>>;
  setpoints?: Maybe<Array<Maybe<CommandDeviceSetpointCalibration>>>;
  waitingForActions?: Maybe<Array<Maybe<CommandProgramAction>>>;
  watching?: Maybe<Array<Maybe<HiveUser>>>;
}

export interface CommandDevicePeripheral {
  __typename?: "CommandDevicePeripheral";
  connectedDevices?: Maybe<Array<Maybe<CommandDevicePeripheralProduct>>>;
  device?: Maybe<CommandDevice>;
  id: ScalarsEnums["ID"];
  mappedDevices?: Maybe<Array<Maybe<CommandDevicePeripheralMap>>>;
  name?: Maybe<ScalarsEnums["String"]>;
  ports?: Maybe<ScalarsEnums["Int"]>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDevicePeripheralMap {
  __typename?: "CommandDevicePeripheralMap";
  device?: Maybe<CommandProgramDevicePlaceholder>;
  id: ScalarsEnums["ID"];
  key?: Maybe<CommandPeripheralProductDatapoint>;
  port?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<CommandProgramDeviceState>;
}

export interface CommandDevicePeripheralPort {
  __typename?: "CommandDevicePeripheralPort";
  port?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDevicePeripheralProduct {
  __typename?: "CommandDevicePeripheralProduct";
  connections?: Maybe<Array<Maybe<CommandPeripheralProductDatapoint>>>;
  deviceId?: Maybe<ScalarsEnums["String"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  peripheral?: Maybe<CommandDevicePeripheral>;
  port?: Maybe<ScalarsEnums["String"]>;
  vendorId?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDevicePlugin {
  __typename?: "CommandDevicePlugin";
  config?: Maybe<Array<Maybe<CommandDevicePluginConfiguration>>>;
  id: ScalarsEnums["ID"];
  plugin?: Maybe<CommandProgramDevicePlugin>;
  rules?: Maybe<CommandProgramFlow>;
}

export interface CommandDevicePluginConfiguration {
  __typename?: "CommandDevicePluginConfiguration";
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<CommandProgramDevicePluginConfiguration>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceReport {
  __typename?: "CommandDeviceReport";
  dataDevice?: Maybe<CommandProgramDevicePlaceholder>;
  dataKey?: Maybe<CommandProgramDeviceState>;
  device?: Maybe<CommandDevice>;
  height?: Maybe<ScalarsEnums["Int"]>;
  id: ScalarsEnums["ID"];
  total?: Maybe<ScalarsEnums["Boolean"]>;
  totalValue: (args?: {
    startDate?: Maybe<Scalars["DateTime"]>;
  }) => Maybe<CommandDeviceTimeseriesTotal>;
  type?: Maybe<ScalarsEnums["String"]>;
  values: (args?: {
    startDate?: Maybe<Scalars["DateTime"]>;
  }) => Maybe<Array<Maybe<CommandDeviceTimeseriesData>>>;
  width?: Maybe<ScalarsEnums["Int"]>;
  x?: Maybe<ScalarsEnums["Int"]>;
  y?: Maybe<ScalarsEnums["Int"]>;
}

export interface CommandDeviceScreen {
  __typename?: "CommandDeviceScreen";
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  provisionCode?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceSetpoint {
  __typename?: "CommandDeviceSetpoint";
  device?: Maybe<CommandProgramDevice>;
  id: ScalarsEnums["ID"];
  key?: Maybe<CommandProgramDeviceState>;
  name?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceSetpointCalibration {
  __typename?: "CommandDeviceSetpointCalibration";
  id?: Maybe<ScalarsEnums["ID"]>;
  setpoint?: Maybe<CommandDeviceSetpoint>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceSnapshot {
  __typename?: "CommandDeviceSnapshot";
  key?: Maybe<ScalarsEnums["String"]>;
  placeholder?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceTimeseriesData {
  __typename?: "CommandDeviceTimeseriesData";
  device?: Maybe<ScalarsEnums["String"]>;
  deviceId?: Maybe<ScalarsEnums["String"]>;
  timestamp?: Maybe<ScalarsEnums["DateTime"]>;
  value?: Maybe<ScalarsEnums["String"]>;
  valueKey?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDeviceTimeseriesTotal {
  __typename?: "CommandDeviceTimeseriesTotal";
  total?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandDeviceValue {
  __typename?: "CommandDeviceValue";
  device?: Maybe<ScalarsEnums["String"]>;
  deviceId?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
  valueKey?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandHMIDevice {
  __typename?: "CommandHMIDevice";
  height?: Maybe<ScalarsEnums["Float"]>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  ports?: Maybe<Array<Maybe<CommandHMIDevicePort>>>;
  width?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandHMIDevicePack {
  __typename?: "CommandHMIDevicePack";
  description?: Maybe<ScalarsEnums["String"]>;
  elements?: Maybe<Array<Maybe<CommandHMIDevice>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  provider?: Maybe<ScalarsEnums["String"]>;
  public?: Maybe<ScalarsEnums["Boolean"]>;
  url?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandHMIDevicePort {
  __typename?: "CommandHMIDevicePort";
  id: ScalarsEnums["ID"];
  key?: Maybe<ScalarsEnums["String"]>;
  rotation?: Maybe<ScalarsEnums["Float"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandHMIEdge {
  __typename?: "CommandHMIEdge";
  from?: Maybe<CommandHMINode>;
  fromHandle?: Maybe<ScalarsEnums["String"]>;
  fromPoint?: Maybe<ScalarsEnums["JSON"]>;
  id: ScalarsEnums["ID"];
  points?: Maybe<Array<Maybe<Point>>>;
  to?: Maybe<CommandHMINode>;
  toHandle?: Maybe<ScalarsEnums["String"]>;
  toPoint?: Maybe<ScalarsEnums["JSON"]>;
}

export interface CommandHMIGroup {
  __typename?: "CommandHMIGroup";
  height?: Maybe<ScalarsEnums["Float"]>;
  id: ScalarsEnums["ID"];
  inputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  nodes?: Maybe<Array<Maybe<CommandHMINode>>>;
  outputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  ports?: Maybe<Array<Maybe<CommandHMIPort>>>;
  rotation?: Maybe<ScalarsEnums["Float"]>;
  width?: Maybe<ScalarsEnums["Float"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandHMINode {
  __typename?: "CommandHMINode";
  children?: Maybe<Array<Maybe<CommandHMINode>>>;
  devicePlaceholder?: Maybe<CommandProgramDevicePlaceholder>;
  flow?: Maybe<Array<Maybe<CommandProgramHMI>>>;
  height?: Maybe<ScalarsEnums["Float"]>;
  id: ScalarsEnums["ID"];
  inputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  options?: Maybe<ScalarsEnums["JSONObject"]>;
  outputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  ports?: Maybe<Array<Maybe<CommandHMIPort>>>;
  rotation?: Maybe<ScalarsEnums["Float"]>;
  showTotalizer?: Maybe<ScalarsEnums["Boolean"]>;
  type?: Maybe<ScalarsEnums["String"]>;
  width?: Maybe<ScalarsEnums["Float"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
  z?: Maybe<ScalarsEnums["Int"]>;
}

export interface CommandHMINodeFlow {
  __typename?: "CommandHMINodeFlow";
  id?: Maybe<ScalarsEnums["ID"]>;
  sourceHandle?: Maybe<ScalarsEnums["String"]>;
  targetHandle?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandHMINodes {
  __typename?: "CommandHMIGroup" | "CommandHMINode";
  $on: $CommandHMINodes;
}

export interface CommandHMIPort {
  __typename?: "CommandHMIPort";
  id: ScalarsEnums["ID"];
  key?: Maybe<ScalarsEnums["String"]>;
  length?: Maybe<ScalarsEnums["Float"]>;
  rotation?: Maybe<ScalarsEnums["Float"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandInterlock {
  __typename?: "CommandInterlock";
  action?: Maybe<CommandProgramDeviceAction>;
  assertion?: Maybe<CommandAssertion>;
  comparator?: Maybe<ScalarsEnums["String"]>;
  device?: Maybe<CommandProgramDevicePlaceholder>;
  id: ScalarsEnums["ID"];
  inputDevice?: Maybe<CommandProgramDevicePlaceholder>;
  inputDeviceKey?: Maybe<CommandProgramDeviceState>;
  state?: Maybe<Array<Maybe<CommandInterlockState>>>;
}

export interface CommandInterlockState {
  __typename?: "CommandInterlockState";
  assertion?: Maybe<CommandAssertion>;
  comparator?: Maybe<ScalarsEnums["String"]>;
  device?: Maybe<CommandProgramDevicePlaceholder>;
  deviceKey?: Maybe<CommandProgramDeviceState>;
  id: ScalarsEnums["ID"];
  interlock?: Maybe<CommandInterlock>;
}

export interface CommandKeyValue {
  __typename?: "CommandKeyValue";
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandPeripheralProductDatapoint {
  __typename?: "CommandPeripheralProductDatapoint";
  direction?: Maybe<ScalarsEnums["String"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  product?: Maybe<CommandDevicePeripheralProduct>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgram {
  __typename?: "CommandProgram";
  alarms?: Maybe<Array<Maybe<CommandProgramAlarm>>>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  devices: (args?: {
    where?: Maybe<CommandProgramDeviceWhere>;
  }) => Maybe<Array<Maybe<CommandProgramDevicePlaceholder>>>;
  id: ScalarsEnums["ID"];
  interface?: Maybe<Array<Maybe<CommandProgramHMI>>>;
  localHomepage?: Maybe<CommandProgramHMI>;
  name?: Maybe<ScalarsEnums["String"]>;
  organisation?: Maybe<HiveOrganisation>;
  program?: Maybe<Array<Maybe<CommandProgramFlow>>>;
  remoteHomepage?: Maybe<CommandProgramHMI>;
  templatePacks?: Maybe<Array<Maybe<CommandHMIDevicePack>>>;
  usedOn?: Maybe<CommandDevice>;
  variables?: Maybe<Array<Maybe<CommandProgramVariable>>>;
}

export interface CommandProgramAction {
  __typename?: "CommandProgramAction";
  flow?: Maybe<Array<Maybe<CommandProgramFlow>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramAlarm {
  __typename?: "CommandProgramAlarm";
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  trigger?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDevice {
  __typename?: "CommandProgramDevice";
  actions?: Maybe<Array<Maybe<CommandProgramDeviceAction>>>;
  config?: Maybe<Array<Maybe<CommandProgramDeviceConfiguration>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  state?: Maybe<Array<Maybe<CommandProgramDeviceState>>>;
  type?: Maybe<ScalarsEnums["String"]>;
  usedIn?: Maybe<Array<Maybe<CommandProgramDevicePlaceholder>>>;
}

export interface CommandProgramDeviceAction {
  __typename?: "CommandProgramDeviceAction";
  device?: Maybe<CommandProgramDevice>;
  func?: Maybe<ScalarsEnums["String"]>;
  id: ScalarsEnums["ID"];
  key?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDeviceCalibration {
  __typename?: "CommandProgramDeviceCalibration";
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  max?: Maybe<ScalarsEnums["String"]>;
  min?: Maybe<ScalarsEnums["String"]>;
  placeholder?: Maybe<CommandProgramDevicePlaceholder>;
  stateItem?: Maybe<CommandProgramDeviceState>;
}

export interface CommandProgramDeviceConfiguration {
  __typename?: "CommandProgramDeviceConfiguration";
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDevicePlaceholder {
  __typename?: "CommandProgramDevicePlaceholder";
  dataInterlocks?: Maybe<Array<Maybe<CommandDataInterlock>>>;
  id: ScalarsEnums["ID"];
  interlocks?: Maybe<Array<Maybe<CommandInterlock>>>;
  name?: Maybe<ScalarsEnums["String"]>;
  plugins?: Maybe<Array<Maybe<CommandDevicePlugin>>>;
  program?: Maybe<CommandProgram>;
  requiresMutex?: Maybe<ScalarsEnums["Boolean"]>;
  setpoints?: Maybe<Array<Maybe<CommandDeviceSetpoint>>>;
  type?: Maybe<CommandProgramDevice>;
  units?: Maybe<Array<Maybe<CommandProgramDeviceUnit>>>;
}

export interface CommandProgramDevicePlugin {
  __typename?: "CommandProgramDevicePlugin";
  compatibility?: Maybe<Array<Maybe<CommandProgramDevicePluginCompatibility>>>;
  config?: Maybe<Array<Maybe<CommandProgramDevicePluginConfiguration>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  tick?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDevicePluginCompatibility {
  __typename?: "CommandProgramDevicePluginCompatibility";
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDevicePluginConfiguration {
  __typename?: "CommandProgramDevicePluginConfiguration";
  id: ScalarsEnums["ID"];
  key?: Maybe<ScalarsEnums["String"]>;
  order?: Maybe<ScalarsEnums["Int"]>;
  plugin?: Maybe<CommandProgramDevicePlugin>;
  requires?: Maybe<Array<Maybe<CommandProgramDevicePluginConfiguration>>>;
  type?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramDeviceState {
  __typename?: "CommandProgramDeviceState";
  device?: Maybe<CommandProgramDevice>;
  id: ScalarsEnums["ID"];
  inputUnits?: Maybe<ScalarsEnums["String"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  max?: Maybe<ScalarsEnums["String"]>;
  min?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<ScalarsEnums["String"]>;
  units?: Maybe<ScalarsEnums["String"]>;
  writable?: Maybe<ScalarsEnums["Boolean"]>;
}

export interface CommandProgramDeviceUnit {
  __typename?: "CommandProgramDeviceUnit";
  device?: Maybe<CommandProgramDevicePlaceholder>;
  displayUnit?: Maybe<ScalarsEnums["String"]>;
  id: ScalarsEnums["ID"];
  inputUnit?: Maybe<ScalarsEnums["String"]>;
  state?: Maybe<CommandProgramDeviceState>;
}

export interface CommandProgramEdge {
  __typename?: "CommandProgramEdge";
  conditions?: Maybe<Array<Maybe<CommandProgramEdgeCondition>>>;
  from?: Maybe<CommandProgramNode>;
  fromHandle?: Maybe<ScalarsEnums["String"]>;
  id: ScalarsEnums["ID"];
  points?: Maybe<Array<Maybe<Point>>>;
  to?: Maybe<CommandProgramNode>;
  toHandle?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramEdgeCondition {
  __typename?: "CommandProgramEdgeCondition";
  assertion?: Maybe<CommandAssertion>;
  comparator?: Maybe<ScalarsEnums["String"]>;
  flow?: Maybe<CommandProgramFlow>;
  id: ScalarsEnums["ID"];
  inputDevice?: Maybe<CommandProgramDevicePlaceholder>;
  inputDeviceKey?: Maybe<CommandProgramDeviceState>;
}

export interface CommandProgramFlow {
  __typename?: "CommandProgramFlow";
  children?: Maybe<Array<Maybe<CommandProgramFlow>>>;
  edges?: Maybe<Array<Maybe<CommandProgramEdge>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  nodes?: Maybe<Array<Maybe<CommandProgramNode>>>;
  parent?: Maybe<CommandProgramFlow>;
  program?: Maybe<CommandProgram>;
}

export interface CommandProgramHMI {
  __typename?: "CommandProgramHMI";
  actions?: Maybe<Array<Maybe<CommandProgramAction>>>;
  edges?: Maybe<Array<Maybe<CommandHMIEdge>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  localHomepage?: Maybe<ScalarsEnums["Boolean"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  nodes?: Maybe<Array<Maybe<CommandHMINode>>>;
  programs?: Maybe<Array<Maybe<CommandProgram>>>;
  remoteHomepage?: Maybe<ScalarsEnums["Boolean"]>;
}

export interface CommandProgramNode {
  __typename?: "CommandProgramNode";
  actions?: Maybe<Array<Maybe<CommandActionItem>>>;
  configuration?: Maybe<Array<Maybe<CommandProgramNodeConfiguration>>>;
  flow?: Maybe<Array<Maybe<CommandProgramFlow>>>;
  id: ScalarsEnums["ID"];
  inputs?: Maybe<Array<Maybe<CommandProgramNode>>>;
  outputs?: Maybe<Array<Maybe<CommandProgramNode>>>;
  subprocess?: Maybe<CommandProgramFlow>;
  timer?: Maybe<CommandProgramNodeTimer>;
  type?: Maybe<ScalarsEnums["String"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
}

export interface CommandProgramNodeConfiguration {
  __typename?: "CommandProgramNodeConfiguration";
  id: ScalarsEnums["ID"];
  key?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramNodeFlowConfiguration {
  __typename?: "CommandProgramNodeFlowConfiguration";
  assertion?: Maybe<ScalarsEnums["String"]>;
  comparator?: Maybe<ScalarsEnums["String"]>;
  flow?: Maybe<CommandProgramFlow>;
  id: ScalarsEnums["ID"];
  inputDevice?: Maybe<CommandProgramDevicePlaceholder>;
  inputDeviceKey?: Maybe<CommandProgramDeviceState>;
}

export interface CommandProgramNodeTimer {
  __typename?: "CommandProgramNodeTimer";
  id: ScalarsEnums["ID"];
  unit?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramVariable {
  __typename?: "CommandProgramVariable";
  defaultValue?: Maybe<ScalarsEnums["String"]>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  program?: Maybe<CommandProgram>;
  type?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandReportPage {
  __typename?: "CommandReportPage";
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  reports?: Maybe<Array<Maybe<CommandDeviceReport>>>;
}

export interface DataLayout {
  __typename?: "DataLayout";
  children?: Maybe<Array<Maybe<DataLayout>>>;
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  label?: Maybe<ScalarsEnums["String"]>;
  parent?: Maybe<DataLayout>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface DeviceAlarm {
  __typename?: "DeviceAlarm";
  cause?: Maybe<ScalarsEnums["String"]>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  message?: Maybe<ScalarsEnums["String"]>;
}

export interface HiveOrganisation {
  __typename?: "HiveOrganisation";
  id: ScalarsEnums["ID"];
}

export interface HiveUser {
  __typename?: "HiveUser";
  id: ScalarsEnums["ID"];
}

export interface MaintenanceWindow {
  __typename?: "MaintenanceWindow";
  device?: Maybe<CommandDevice>;
  endTime?: Maybe<ScalarsEnums["DateTime"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  owner?: Maybe<ScalarsEnums["String"]>;
  startTime?: Maybe<ScalarsEnums["DateTime"]>;
}

export interface Point {
  __typename?: "Point";
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
}

export interface Mutation {
  __typename?: "Mutation";
  changeDeviceMode: (args?: {
    deviceId?: Maybe<Scalars["String"]>;
    deviceName?: Maybe<Scalars["String"]>;
    mode?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  changeDeviceValue: (args?: {
    deviceId?: Maybe<Scalars["String"]>;
    deviceName?: Maybe<Scalars["String"]>;
    key?: Maybe<Scalars["String"]>;
    value?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  changeMode: (args?: {
    deviceId?: Maybe<Scalars["String"]>;
    mode?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  changeState: (args?: {
    deviceId?: Maybe<Scalars["String"]>;
    state?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  createCommandDevice: (args: { input: CommandDeviceInput }) => CommandDevice;
  createCommandDeviceCalibration: (args: {
    device: Scalars["ID"];
    input?: Maybe<CommandProgramDeviceCalibrationInput>;
  }) => Maybe<CommandProgramDeviceCalibration>;
  createCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: MaintenanceWindowInput;
  }) => MaintenanceWindow;
  createCommandDeviceReport: (args?: {
    input?: Maybe<CommandDeviceReportInput>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceReport>;
  createCommandInterfaceDevice: (args?: {
    input?: Maybe<CommandHMIDeviceInput>;
    pack?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIDevice>;
  createCommandInterfacePack: (args?: {
    input?: Maybe<CommandHMIDevicePackInput>;
  }) => Maybe<CommandHMIDevicePack>;
  createCommandProgram: (args: {
    input: CommandProgramInput;
  }) => CommandProgram;
  createCommandProgramDataDeviceInterlock: (args: {
    device: Scalars["ID"];
    input: CommandProgramDataDeviceInterlockInput;
    program: Scalars["ID"];
  }) => CommandDataInterlock;
  createCommandProgramDevice: (args: {
    input: CommandProgramDeviceInput;
    program: Scalars["ID"];
  }) => CommandProgramDevicePlaceholder;
  createCommandProgramDeviceInterlock: (args: {
    device: Scalars["ID"];
    input: CommandProgramDeviceInterlockInput;
    program: Scalars["ID"];
  }) => CommandInterlock;
  createCommandProgramDevicePlugin: (args: {
    device: Scalars["ID"];
    input: CommandDevicePluginInput;
    program: Scalars["ID"];
  }) => CommandDevicePlugin;
  createCommandProgramDeviceSetpoint: (args: {
    device: Scalars["ID"];
    input: CommandProgramDeviceSetpointInput;
    program: Scalars["ID"];
  }) => CommandDeviceSetpoint;
  createCommandProgramFlow: (args: {
    input: CommandProgramFlowInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramFlow;
  createCommandProgramFlowEdge: (args: {
    flow?: Maybe<Scalars["ID"]>;
    input: CommandProgramFlowEdgeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramEdge;
  createCommandProgramFlowEdgeCondition: (args: {
    edge?: Maybe<Scalars["ID"]>;
    flow?: Maybe<Scalars["ID"]>;
    input: CommandProgramFlowEdgeConditionInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramEdgeCondition;
  createCommandProgramFlowNode: (args: {
    flow?: Maybe<Scalars["ID"]>;
    input: CommandProgramFlowNodeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramNode;
  createCommandProgramFlowNodeAction: (args: {
    flow?: Maybe<Scalars["ID"]>;
    input: CommandProgramFlowNodeActionInput;
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandActionItem;
  createCommandProgramInterface: (args: {
    input: CommandProgramInterfaceInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramHMI>;
  createCommandProgramInterfaceEdge: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    input: ComandProgramInterfaceEdgeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIEdge>;
  createCommandProgramInterfaceGroup: (args: {
    input: ComandProgramInterfaceGroupInput;
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIGroup>;
  createCommandProgramInterfaceNode: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    input: ComandProgramInterfaceNodeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMINode>;
  createCommandProgramVariable: (args: {
    input: CommandProgramVariableInput;
    program: Scalars["ID"];
  }) => CommandProgramVariable;
  createCommandReportPage: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: CommandReportPageInput;
  }) => CommandReportPage;
  createDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: DeviceScreenInput;
  }) => Maybe<CommandDeviceScreen>;
  deleteCommandDevice: (args: { where: CommandDeviceWhere }) => CommandDevice;
  deleteCommandDeviceCalibration: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
  }) => Maybe<CommandProgramDeviceCalibration>;
  deleteCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
  }) => MaintenanceWindow;
  deleteCommandDeviceReport: (args?: {
    id?: Maybe<Scalars["ID"]>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceReport>;
  deleteCommandInterfaceDevice: (args: {
    id: Scalars["ID"];
    pack?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIDevice>;
  deleteCommandInterfacePack: (args: {
    id: Scalars["ID"];
  }) => Maybe<CommandHMIDevicePack>;
  deleteCommandProgram: (args: {
    id: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramDataDeviceInterlock: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramDevice: (args: {
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramDeviceInterlock: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramDevicePlugin: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramDeviceSetpoint: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramFlow: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramFlowEdge: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramFlowEdgeCondition: (args: {
    edge?: Maybe<Scalars["ID"]>;
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramFlowNode: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramFlowNodeAction: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramInterface: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramHMI>;
  deleteCommandProgramInterfaceEdge: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIEdge>;
  deleteCommandProgramInterfaceGroup: (args: {
    id: Scalars["ID"];
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIGroup>;
  deleteCommandProgramInterfaceNode: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMINode>;
  deleteCommandProgramVariable: (args: {
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => CommandProgramVariable;
  deleteCommandReportPage: (args?: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
  }) => CommandReportPage;
  deleteDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
  }) => Maybe<CommandDeviceScreen>;
  performDeviceAction: (args?: {
    action?: Maybe<Scalars["String"]>;
    deviceId?: Maybe<Scalars["String"]>;
    deviceName?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  requestFlow: (args?: {
    actionId?: Maybe<Scalars["String"]>;
    deviceId?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  updateCommandDevice: (args: {
    input: CommandDeviceInput;
    where: CommandDeviceWhere;
  }) => CommandDevice;
  updateCommandDeviceCalibration: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    input?: Maybe<CommandProgramDeviceCalibrationInput>;
  }) => Maybe<CommandProgramDeviceCalibration>;
  updateCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: MaintenanceWindowInput;
  }) => MaintenanceWindow;
  updateCommandDeviceReport: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandDeviceReportInput>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceReport>;
  updateCommandDeviceReportGrid: (args?: {
    device?: Maybe<Scalars["ID"]>;
    grid?: Maybe<Array<Maybe<CommandDeviceReportInput>>>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<Array<Maybe<CommandDeviceReport>>>;
  updateCommandDeviceSetpoint: (args: {
    device: Scalars["ID"];
    setpoint: Scalars["ID"];
    value?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["String"]>;
  updateCommandDeviceUptime: (args: {
    uptime?: Maybe<Scalars["DateTime"]>;
    where: CommandDeviceWhere;
  }) => CommandDevice;
  updateCommandInterfaceDevice: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandHMIDeviceInput>;
    pack?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIDevice>;
  updateCommandInterfacePack: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandHMIDevicePackInput>;
  }) => Maybe<CommandHMIDevicePack>;
  updateCommandProgram: (args: {
    id: Scalars["ID"];
    input: CommandProgramInput;
  }) => CommandProgram;
  updateCommandProgramDataDeviceInterlock: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    input: CommandProgramDataDeviceInterlockInput;
    program: Scalars["ID"];
  }) => CommandDataInterlock;
  updateCommandProgramDevice: (args: {
    id: Scalars["ID"];
    input: CommandProgramDeviceInput;
    program: Scalars["ID"];
  }) => CommandProgramDevicePlaceholder;
  updateCommandProgramDeviceInterlock: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    input: CommandProgramDeviceInterlockInput;
    program: Scalars["ID"];
  }) => CommandInterlock;
  updateCommandProgramDevicePlugin: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    input: CommandDevicePluginInput;
    program: Scalars["ID"];
  }) => CommandDevicePlugin;
  updateCommandProgramDeviceSetpoint: (args: {
    device: Scalars["ID"];
    id: Scalars["ID"];
    input: CommandProgramDeviceSetpointInput;
    program: Scalars["ID"];
  }) => CommandDeviceSetpoint;
  updateCommandProgramFlow: (args: {
    id: Scalars["ID"];
    input: CommandProgramFlowInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramFlow;
  updateCommandProgramFlowEdge: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: CommandProgramFlowEdgeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramEdge;
  updateCommandProgramFlowEdgeCondition: (args: {
    edge?: Maybe<Scalars["ID"]>;
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: CommandProgramFlowEdgeConditionInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramEdgeCondition;
  updateCommandProgramFlowNode: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: CommandProgramFlowNodeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandProgramNode;
  updateCommandProgramFlowNodeAction: (args: {
    flow?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input: CommandProgramFlowNodeActionInput;
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => CommandActionItem;
  updateCommandProgramInterface: (args: {
    id: Scalars["ID"];
    input: CommandProgramInterfaceInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramHMI>;
  updateCommandProgramInterfaceEdge: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input: ComandProgramInterfaceEdgeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIEdge>;
  updateCommandProgramInterfaceGroup: (args: {
    id?: Maybe<Scalars["ID"]>;
    input: ComandProgramInterfaceGroupInput;
    node?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMIGroup>;
  updateCommandProgramInterfaceNode: (args: {
    hmi?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input: ComandProgramInterfaceNodeInput;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandHMINode>;
  updateCommandProgramVariable: (args: {
    id: Scalars["ID"];
    input: CommandProgramVariableInput;
    program: Scalars["ID"];
  }) => CommandProgramVariable;
  updateCommandReportPage: (args: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input: CommandReportPageInput;
  }) => CommandReportPage;
  updateDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: DeviceScreenInput;
  }) => Maybe<CommandDeviceScreen>;
}

export interface Query {
  __typename?: "Query";
  _sdl: ScalarsEnums["String"];
  commandDeviceTimeseries: (args?: {
    device?: Maybe<Scalars["String"]>;
    deviceId?: Maybe<Scalars["String"]>;
    startDate?: Maybe<Scalars["String"]>;
    valueKey?: Maybe<Scalars["String"]>;
  }) => Maybe<Array<Maybe<CommandDeviceTimeseriesData>>>;
  commandDeviceTimeseriesTotal: (args?: {
    device?: Maybe<Scalars["String"]>;
    deviceId?: Maybe<Scalars["String"]>;
    endDate?: Maybe<Scalars["String"]>;
    startDate?: Maybe<Scalars["String"]>;
    valueKey?: Maybe<Scalars["String"]>;
  }) => Maybe<CommandDeviceTimeseriesTotal>;
  commandDeviceValue: (args?: {
    bus?: Maybe<Scalars["String"]>;
    device?: Maybe<Scalars["String"]>;
    port?: Maybe<Scalars["String"]>;
  }) => Maybe<Array<Maybe<CommandDeviceValue>>>;
  commandDevices: (args?: {
    where?: Maybe<CommandDeviceWhere>;
  }) => Array<Maybe<CommandDevice>>;
  commandInterfaceDevicePacks: (args?: {
    id?: Maybe<Scalars["ID"]>;
    registered?: Maybe<Scalars["Boolean"]>;
  }) => Maybe<Array<Maybe<CommandHMIDevicePack>>>;
  commandInterfaceDevices: Array<CommandHMIDevice>;
  commandProgramDevicePlugins: Array<Maybe<CommandProgramDevicePlugin>>;
  commandProgramDevices: Array<Maybe<CommandProgramDevice>>;
  commandProgramFlows: (args?: {
    where?: Maybe<CommandProgramFlowWhere>;
  }) => Array<Maybe<CommandProgramFlow>>;
  commandPrograms: (args?: {
    where?: Maybe<CommandProgramWhere>;
  }) => Array<Maybe<CommandProgram>>;
  hash: (args: { input: Scalars["String"] }) => Maybe<ScalarsEnums["Hash"]>;
}

export interface Subscription {
  __typename?: "Subscription";
  watchingDevice: (args: {
    device: Scalars["ID"];
  }) => Maybe<Array<Maybe<HiveUser>>>;
}

export interface SchemaObjectTypes {
  CommandActionItem: CommandActionItem;
  CommandAssertion: CommandAssertion;
  CommandDataInterlock: CommandDataInterlock;
  CommandDevice: CommandDevice;
  CommandDevicePeripheral: CommandDevicePeripheral;
  CommandDevicePeripheralMap: CommandDevicePeripheralMap;
  CommandDevicePeripheralPort: CommandDevicePeripheralPort;
  CommandDevicePeripheralProduct: CommandDevicePeripheralProduct;
  CommandDevicePlugin: CommandDevicePlugin;
  CommandDevicePluginConfiguration: CommandDevicePluginConfiguration;
  CommandDeviceReport: CommandDeviceReport;
  CommandDeviceScreen: CommandDeviceScreen;
  CommandDeviceSetpoint: CommandDeviceSetpoint;
  CommandDeviceSetpointCalibration: CommandDeviceSetpointCalibration;
  CommandDeviceSnapshot: CommandDeviceSnapshot;
  CommandDeviceTimeseriesData: CommandDeviceTimeseriesData;
  CommandDeviceTimeseriesTotal: CommandDeviceTimeseriesTotal;
  CommandDeviceValue: CommandDeviceValue;
  CommandHMIDevice: CommandHMIDevice;
  CommandHMIDevicePack: CommandHMIDevicePack;
  CommandHMIDevicePort: CommandHMIDevicePort;
  CommandHMIEdge: CommandHMIEdge;
  CommandHMIGroup: CommandHMIGroup;
  CommandHMINode: CommandHMINode;
  CommandHMINodeFlow: CommandHMINodeFlow;
  CommandHMIPort: CommandHMIPort;
  CommandInterlock: CommandInterlock;
  CommandInterlockState: CommandInterlockState;
  CommandKeyValue: CommandKeyValue;
  CommandPeripheralProductDatapoint: CommandPeripheralProductDatapoint;
  CommandProgram: CommandProgram;
  CommandProgramAction: CommandProgramAction;
  CommandProgramAlarm: CommandProgramAlarm;
  CommandProgramDevice: CommandProgramDevice;
  CommandProgramDeviceAction: CommandProgramDeviceAction;
  CommandProgramDeviceCalibration: CommandProgramDeviceCalibration;
  CommandProgramDeviceConfiguration: CommandProgramDeviceConfiguration;
  CommandProgramDevicePlaceholder: CommandProgramDevicePlaceholder;
  CommandProgramDevicePlugin: CommandProgramDevicePlugin;
  CommandProgramDevicePluginCompatibility: CommandProgramDevicePluginCompatibility;
  CommandProgramDevicePluginConfiguration: CommandProgramDevicePluginConfiguration;
  CommandProgramDeviceState: CommandProgramDeviceState;
  CommandProgramDeviceUnit: CommandProgramDeviceUnit;
  CommandProgramEdge: CommandProgramEdge;
  CommandProgramEdgeCondition: CommandProgramEdgeCondition;
  CommandProgramFlow: CommandProgramFlow;
  CommandProgramHMI: CommandProgramHMI;
  CommandProgramNode: CommandProgramNode;
  CommandProgramNodeConfiguration: CommandProgramNodeConfiguration;
  CommandProgramNodeFlowConfiguration: CommandProgramNodeFlowConfiguration;
  CommandProgramNodeTimer: CommandProgramNodeTimer;
  CommandProgramVariable: CommandProgramVariable;
  CommandReportPage: CommandReportPage;
  DataLayout: DataLayout;
  DeviceAlarm: DeviceAlarm;
  HiveOrganisation: HiveOrganisation;
  HiveUser: HiveUser;
  MaintenanceWindow: MaintenanceWindow;
  Mutation: Mutation;
  Point: Point;
  Query: Query;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames =
  | "CommandActionItem"
  | "CommandAssertion"
  | "CommandDataInterlock"
  | "CommandDevice"
  | "CommandDevicePeripheral"
  | "CommandDevicePeripheralMap"
  | "CommandDevicePeripheralPort"
  | "CommandDevicePeripheralProduct"
  | "CommandDevicePlugin"
  | "CommandDevicePluginConfiguration"
  | "CommandDeviceReport"
  | "CommandDeviceScreen"
  | "CommandDeviceSetpoint"
  | "CommandDeviceSetpointCalibration"
  | "CommandDeviceSnapshot"
  | "CommandDeviceTimeseriesData"
  | "CommandDeviceTimeseriesTotal"
  | "CommandDeviceValue"
  | "CommandHMIDevice"
  | "CommandHMIDevicePack"
  | "CommandHMIDevicePort"
  | "CommandHMIEdge"
  | "CommandHMIGroup"
  | "CommandHMINode"
  | "CommandHMINodeFlow"
  | "CommandHMIPort"
  | "CommandInterlock"
  | "CommandInterlockState"
  | "CommandKeyValue"
  | "CommandPeripheralProductDatapoint"
  | "CommandProgram"
  | "CommandProgramAction"
  | "CommandProgramAlarm"
  | "CommandProgramDevice"
  | "CommandProgramDeviceAction"
  | "CommandProgramDeviceCalibration"
  | "CommandProgramDeviceConfiguration"
  | "CommandProgramDevicePlaceholder"
  | "CommandProgramDevicePlugin"
  | "CommandProgramDevicePluginCompatibility"
  | "CommandProgramDevicePluginConfiguration"
  | "CommandProgramDeviceState"
  | "CommandProgramDeviceUnit"
  | "CommandProgramEdge"
  | "CommandProgramEdgeCondition"
  | "CommandProgramFlow"
  | "CommandProgramHMI"
  | "CommandProgramNode"
  | "CommandProgramNodeConfiguration"
  | "CommandProgramNodeFlowConfiguration"
  | "CommandProgramNodeTimer"
  | "CommandProgramVariable"
  | "CommandReportPage"
  | "DataLayout"
  | "DeviceAlarm"
  | "HiveOrganisation"
  | "HiveUser"
  | "MaintenanceWindow"
  | "Mutation"
  | "Point"
  | "Query"
  | "Subscription";

export interface $CommandHMINodes {
  CommandHMIGroup?: CommandHMIGroup;
  CommandHMINode?: CommandHMINode;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
