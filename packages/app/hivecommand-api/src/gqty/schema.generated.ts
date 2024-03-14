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
  height?: InputMaybe<Scalars["Float"]>;
  id?: InputMaybe<Scalars["String"]>;
  options?: InputMaybe<Scalars["JSONObject"]>;
  ports?: InputMaybe<Array<InputMaybe<CommandHMIPortInput>>>;
  rotation?: InputMaybe<Scalars["Float"]>;
  scaleX?: InputMaybe<Scalars["Float"]>;
  scaleY?: InputMaybe<Scalars["Float"]>;
  showTotalizer?: InputMaybe<Scalars["Boolean"]>;
  template?: InputMaybe<Scalars["String"]>;
  templateOptions?: InputMaybe<Scalars["JSON"]>;
  type?: InputMaybe<Scalars["String"]>;
  width?: InputMaybe<Scalars["Float"]>;
  x?: InputMaybe<Scalars["Float"]>;
  y?: InputMaybe<Scalars["Float"]>;
  zIndex?: InputMaybe<Scalars["Float"]>;
}

export interface CommandAnalyticPageInput {
  name?: InputMaybe<Scalars["String"]>;
}

export interface CommandAnalyticPageWhere {
  ids?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
}

export interface CommandDataScopePluginsInput {
  configuration?: InputMaybe<Scalars["JSON"]>;
  module?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceAnalyticInput {
  device?: InputMaybe<Scalars["String"]>;
  height?: InputMaybe<Scalars["Int"]>;
  id?: InputMaybe<Scalars["ID"]>;
  subkeyId?: InputMaybe<Scalars["String"]>;
  tagId?: InputMaybe<Scalars["String"]>;
  timeBucket?: InputMaybe<Scalars["String"]>;
  total?: InputMaybe<Scalars["Boolean"]>;
  type?: InputMaybe<Scalars["String"]>;
  unit?: InputMaybe<Scalars["String"]>;
  width?: InputMaybe<Scalars["Int"]>;
  x?: InputMaybe<Scalars["Int"]>;
  y?: InputMaybe<Scalars["Int"]>;
}

export interface CommandDeviceInput {
  deviceSnapshot?: InputMaybe<Array<InputMaybe<CommandDeviceSnapshotInput>>>;
  name?: InputMaybe<Scalars["String"]>;
  network_name?: InputMaybe<Scalars["String"]>;
  program?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceReportFieldInput {
  bucket?: InputMaybe<Scalars["String"]>;
  device?: InputMaybe<Scalars["String"]>;
  key?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceReportInput {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  name?: InputMaybe<Scalars["String"]>;
  recurring?: InputMaybe<Scalars["Boolean"]>;
  reportLength?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
}

export interface CommandDeviceSnapshotInput {
  key?: InputMaybe<Scalars["String"]>;
  placeholder?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["String"]>;
}

export interface CommandDeviceSnapshotWhere {
  blocks?: InputMaybe<Scalars["Float"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
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

export interface CommandProgramAlarmInput {
  script?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramAlarmPathwayInput {
  name?: InputMaybe<Scalars["String"]>;
  scope?: InputMaybe<Scalars["String"]>;
  script?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramComponentInput {
  description?: InputMaybe<Scalars["String"]>;
  mainId?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  properties?: InputMaybe<
    Array<InputMaybe<CommandProgramComponentPropertyInput>>
  >;
}

export interface CommandProgramComponentPropertyInput {
  id?: InputMaybe<Scalars["ID"]>;
  key?: InputMaybe<Scalars["String"]>;
  scalar?: InputMaybe<Scalars["String"]>;
  typeId?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramComponentWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandProgramDataScopeInput {
  configuration?: InputMaybe<Scalars["JSON"]>;
  description?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  pluginId?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceCalibrationInput {
  max?: InputMaybe<Scalars["String"]>;
  min?: InputMaybe<Scalars["String"]>;
  placeholder?: InputMaybe<Scalars["String"]>;
  stateItem?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramDeviceWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandProgramInput {
  name?: InputMaybe<Scalars["String"]>;
  templatePacks?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  worldOptions?: InputMaybe<Scalars["JSON"]>;
}

export interface CommandProgramInterfaceInput {
  localHomepage?: InputMaybe<Scalars["Boolean"]>;
  name?: InputMaybe<Scalars["String"]>;
  remoteHomepage?: InputMaybe<Scalars["Boolean"]>;
}

export interface CommandProgramTagInput {
  name?: InputMaybe<Scalars["String"]>;
  scope?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramTypeFieldInput {
  name?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramTypeInput {
  fields?: InputMaybe<Array<InputMaybe<CommandProgramTypeFieldInput>>>;
  name?: InputMaybe<Scalars["String"]>;
}

export interface CommandProgramWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandSchematicInput {
  name?: InputMaybe<Scalars["String"]>;
  templatePacks?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
}

export interface CommandSchematicPageInput {
  edges?: InputMaybe<Scalars["JSON"]>;
  name?: InputMaybe<Scalars["String"]>;
  nodes?: InputMaybe<Scalars["JSON"]>;
  templateId?: InputMaybe<Scalars["String"]>;
}

export interface CommandSchematicPageTemplateInput {
  name?: InputMaybe<Scalars["String"]>;
  nodes?: InputMaybe<Scalars["JSON"]>;
}

export interface CommandSchematicVersionInput {
  commit?: InputMaybe<Scalars["String"]>;
}

export interface CommandSchematicWhere {
  id?: InputMaybe<Scalars["ID"]>;
}

export interface CommandTemplateEdgeInput {
  from?: InputMaybe<Scalars["ID"]>;
  script?: InputMaybe<Scalars["String"]>;
  to?: InputMaybe<Scalars["ID"]>;
}

export interface CommandTemplateIOInput {
  direction?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
}

export interface CommandTemplateTransformerInput {
  name?: InputMaybe<Scalars["String"]>;
}

export interface ConnectDevicesInput {
  device?: InputMaybe<Scalars["ID"]>;
  deviceState?: InputMaybe<Scalars["ID"]>;
  id?: InputMaybe<Scalars["ID"]>;
  path?: InputMaybe<Scalars["String"]>;
}

export interface DeviceScreenInput {
  developer?: InputMaybe<Scalars["Boolean"]>;
  name?: InputMaybe<Scalars["String"]>;
}

export interface MaintenanceWindowInput {
  endTime?: InputMaybe<Scalars["DateTime"]>;
  startTime?: InputMaybe<Scalars["DateTime"]>;
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
    height: { __type: "Float" },
    id: { __type: "String" },
    options: { __type: "JSONObject" },
    ports: { __type: "[CommandHMIPortInput]" },
    rotation: { __type: "Float" },
    scaleX: { __type: "Float" },
    scaleY: { __type: "Float" },
    showTotalizer: { __type: "Boolean" },
    template: { __type: "String" },
    templateOptions: { __type: "JSON" },
    type: { __type: "String" },
    width: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
    zIndex: { __type: "Float" },
  },
  CommandAnalyticPage: {
    __typename: { __type: "String!" },
    charts: { __type: "[CommandDeviceAnalytic]" },
    createdAt: { __type: "DateTime" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    name: { __type: "String" },
  },
  CommandAnalyticPageInput: { name: { __type: "String" } },
  CommandAnalyticPageWhere: { ids: { __type: "[ID]" } },
  CommandDataScopePlugin: {
    __typename: { __type: "String!" },
    configuration: { __type: "JSON" },
    id: { __type: "ID" },
    module: { __type: "String" },
    name: { __type: "String" },
  },
  CommandDataScopePluginsInput: {
    configuration: { __type: "JSON" },
    module: { __type: "String" },
    name: { __type: "String" },
  },
  CommandDataTransformer: {
    __typename: { __type: "String!" },
    configuration: { __type: "[CommandDataTransformerConfiguration]" },
    id: { __type: "ID" },
    options: { __type: "JSON" },
    template: { __type: "CommandTemplateTransformer" },
  },
  CommandDataTransformerConfiguration: {
    __typename: { __type: "String!" },
    field: { __type: "CommandTemplateIO" },
    id: { __type: "ID" },
    value: { __type: "String" },
  },
  CommandDevice: {
    __typename: { __type: "String!" },
    activeProgram: { __type: "CommandProgram" },
    alarms: { __type: "[DeviceAlarm]" },
    analyticPages: {
      __type: "[CommandAnalyticPage]",
      __args: { where: "CommandAnalyticPageWhere" },
    },
    createdAt: { __type: "DateTime" },
    dataLayout: { __type: "JSON" },
    deviceSnapshot: {
      __type: "[CommandDeviceSnapshot]",
      __args: { where: "CommandDeviceSnapshotWhere" },
    },
    id: { __type: "ID!" },
    lastSeen: { __type: "DateTime" },
    maintenanceWindows: { __type: "[MaintenanceWindow]" },
    name: { __type: "String" },
    network_name: { __type: "String" },
    online: { __type: "Boolean" },
    operatingMode: { __type: "String" },
    operatingState: { __type: "String" },
    organisation: { __type: "HiveOrganisation" },
    provisionCode: { __type: "String" },
    provisioned: { __type: "Boolean" },
    reports: { __type: "[CommandDeviceReport]" },
    screens: { __type: "[CommandDeviceScreen]" },
    watching: { __type: "[HiveUser]" },
  },
  CommandDeviceAnalytic: {
    __typename: { __type: "String!" },
    device: { __type: "CommandDevice" },
    height: { __type: "Int" },
    id: { __type: "ID!" },
    subkey: { __type: "CommandProgramTypeField" },
    tag: { __type: "CommandProgramTag" },
    timeBucket: { __type: "String" },
    total: { __type: "Boolean" },
    totalValue: {
      __type: "CommandDeviceTimeseriesTotal",
      __args: { endDate: "DateTime", startDate: "DateTime" },
    },
    type: { __type: "String" },
    unit: { __type: "String" },
    values: {
      __type: "[CommandDeviceTimeseriesData]",
      __args: { endDate: "DateTime", format: "String", startDate: "DateTime" },
    },
    width: { __type: "Int" },
    x: { __type: "Int" },
    y: { __type: "Int" },
  },
  CommandDeviceAnalyticInput: {
    device: { __type: "String" },
    height: { __type: "Int" },
    id: { __type: "ID" },
    subkeyId: { __type: "String" },
    tagId: { __type: "String" },
    timeBucket: { __type: "String" },
    total: { __type: "Boolean" },
    type: { __type: "String" },
    unit: { __type: "String" },
    width: { __type: "Int" },
    x: { __type: "Int" },
    y: { __type: "Int" },
  },
  CommandDeviceInput: {
    deviceSnapshot: { __type: "[CommandDeviceSnapshotInput]" },
    name: { __type: "String" },
    network_name: { __type: "String" },
    program: { __type: "String" },
  },
  CommandDeviceReport: {
    __typename: { __type: "String!" },
    device: { __type: "CommandDevice" },
    fields: { __type: "[CommandDeviceReportField]" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    recurring: { __type: "Boolean" },
    reportLength: { __type: "String" },
    startDate: { __type: "DateTime" },
  },
  CommandDeviceReportField: {
    __typename: { __type: "String!" },
    bucket: { __type: "String" },
    device: { __type: "CommandProgramTag" },
    id: { __type: "ID!" },
    key: { __type: "CommandProgramTypeField" },
  },
  CommandDeviceReportFieldInput: {
    bucket: { __type: "String" },
    device: { __type: "String" },
    key: { __type: "String" },
  },
  CommandDeviceReportInput: {
    endDate: { __type: "DateTime" },
    name: { __type: "String" },
    recurring: { __type: "Boolean" },
    reportLength: { __type: "String" },
    startDate: { __type: "DateTime" },
  },
  CommandDeviceScreen: {
    __typename: { __type: "String!" },
    createdAt: { __type: "DateTime" },
    device: { __type: "CommandDevice" },
    id: { __type: "ID" },
    name: { __type: "String" },
    provisionCode: { __type: "String" },
    provisioned: { __type: "Boolean" },
  },
  CommandDeviceSnapshot: {
    __typename: { __type: "String!" },
    key: { __type: "String" },
    lastUpdated: { __type: "DateTime" },
    placeholder: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDeviceSnapshotInput: {
    key: { __type: "String" },
    placeholder: { __type: "String" },
    value: { __type: "String" },
  },
  CommandDeviceSnapshotWhere: {
    blocks: { __type: "Float" },
    endDate: { __type: "DateTime" },
    startDate: { __type: "DateTime" },
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
    dataTransformer: { __type: "CommandDataTransformer" },
    flow: { __type: "[CommandProgramHMI]" },
    height: { __type: "Float" },
    id: { __type: "ID!" },
    inputs: { __type: "[CommandHMINode]" },
    options: { __type: "JSONObject" },
    outputs: { __type: "[CommandHMINode]" },
    ports: { __type: "[CommandHMIPort]" },
    rotation: { __type: "Float" },
    scaleX: { __type: "Float" },
    scaleY: { __type: "Float" },
    showTotalizer: { __type: "Boolean" },
    type: { __type: "String" },
    width: { __type: "Float" },
    x: { __type: "Float" },
    y: { __type: "Float" },
    zIndex: { __type: "Float" },
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
  CommandKeyValue: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    key: { __type: "String" },
    value: { __type: "String" },
  },
  CommandProgram: {
    __typename: { __type: "String!" },
    alarmPathways: { __type: "[CommandProgramAlarmPathway]" },
    alarms: { __type: "[CommandProgramAlarm]" },
    components: {
      __type: "[CommandProgramComponent]",
      __args: { where: "CommandProgramComponentWhere" },
    },
    createdAt: { __type: "DateTime" },
    dataScopes: { __type: "[CommandProgramDataScope]" },
    id: { __type: "ID!" },
    interface: { __type: "[CommandProgramHMI]" },
    localHomepage: { __type: "CommandProgramHMI" },
    name: { __type: "String" },
    organisation: { __type: "HiveOrganisation" },
    remoteHomepage: { __type: "CommandProgramHMI" },
    tags: { __type: "[CommandProgramTag]" },
    templatePacks: { __type: "[CommandHMIDevicePack]" },
    templates: { __type: "[CommandTemplateTransformer]" },
    types: { __type: "[CommandProgramType]" },
    usedOn: { __type: "CommandDevice" },
    worldOptions: { __type: "JSON" },
  },
  CommandProgramAlarm: {
    __typename: { __type: "String!" },
    compileError: { __type: "Boolean" },
    createdAt: { __type: "DateTime" },
    id: { __type: "ID" },
    rank: { __type: "String" },
    script: { __type: "String" },
    title: { __type: "String" },
  },
  CommandProgramAlarmInput: {
    script: { __type: "String" },
    title: { __type: "String" },
  },
  CommandProgramAlarmPathway: {
    __typename: { __type: "String!" },
    compileError: { __type: "Boolean" },
    id: { __type: "ID" },
    name: { __type: "String" },
    scope: { __type: "String" },
    script: { __type: "String" },
  },
  CommandProgramAlarmPathwayInput: {
    name: { __type: "String" },
    scope: { __type: "String" },
    script: { __type: "String" },
  },
  CommandProgramComponent: {
    __typename: { __type: "String!" },
    description: { __type: "String" },
    files: { __type: "[CommandProgramComponentFile]" },
    id: { __type: "ID" },
    main: { __type: "CommandProgramComponentFile" },
    name: { __type: "String" },
    program: { __type: "CommandProgram" },
    properties: { __type: "[CommandProgramComponentProperty]" },
  },
  CommandProgramComponentFile: {
    __typename: { __type: "String!" },
    content: { __type: "String" },
    id: { __type: "ID" },
    path: { __type: "String" },
  },
  CommandProgramComponentInput: {
    description: { __type: "String" },
    mainId: { __type: "String" },
    name: { __type: "String" },
    properties: { __type: "[CommandProgramComponentPropertyInput]" },
  },
  CommandProgramComponentProperty: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    key: { __type: "String" },
    scalar: { __type: "String" },
    type: { __type: "CommandProgramType" },
  },
  CommandProgramComponentPropertyInput: {
    id: { __type: "ID" },
    key: { __type: "String" },
    scalar: { __type: "String" },
    typeId: { __type: "String" },
  },
  CommandProgramComponentWhere: { id: { __type: "ID" } },
  CommandProgramDataScope: {
    __typename: { __type: "String!" },
    configuration: { __type: "JSON" },
    description: { __type: "String" },
    id: { __type: "ID" },
    name: { __type: "String" },
    plugin: { __type: "CommandDataScopePlugin" },
    program: { __type: "CommandProgram" },
  },
  CommandProgramDataScopeInput: {
    configuration: { __type: "JSON" },
    description: { __type: "String" },
    name: { __type: "String" },
    pluginId: { __type: "String" },
  },
  CommandProgramDeviceCalibrationInput: {
    max: { __type: "String" },
    min: { __type: "String" },
    placeholder: { __type: "String" },
    stateItem: { __type: "String" },
  },
  CommandProgramDeviceWhere: { id: { __type: "ID" } },
  CommandProgramHMI: {
    __typename: { __type: "String!" },
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
    worldOptions: { __type: "JSON" },
  },
  CommandProgramInterfaceInput: {
    localHomepage: { __type: "Boolean" },
    name: { __type: "String" },
    remoteHomepage: { __type: "Boolean" },
  },
  CommandProgramTag: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    name: { __type: "String" },
    scope: { __type: "CommandProgramDataScope" },
    type: { __type: "String" },
  },
  CommandProgramTagInput: {
    name: { __type: "String" },
    scope: { __type: "String" },
    type: { __type: "String" },
  },
  CommandProgramType: {
    __typename: { __type: "String!" },
    fields: { __type: "[CommandProgramTypeField]" },
    id: { __type: "ID" },
    name: { __type: "String" },
    usedByTag: { __type: "[CommandProgramTag]" },
  },
  CommandProgramTypeField: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    name: { __type: "String" },
    type: { __type: "String" },
  },
  CommandProgramTypeFieldInput: {
    name: { __type: "String" },
    type: { __type: "String" },
  },
  CommandProgramTypeInput: {
    fields: { __type: "[CommandProgramTypeFieldInput]" },
    name: { __type: "String" },
  },
  CommandProgramWhere: { id: { __type: "ID" } },
  CommandSchematic: {
    __typename: { __type: "String!" },
    createdAt: { __type: "DateTime" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    organisation: { __type: "HiveOrganisation" },
    pages: { __type: "[CommandSchematicPage]" },
    templates: { __type: "[CommandSchematicPageTemplate]" },
    versions: { __type: "[CommandSchematicVersion]" },
  },
  CommandSchematicInput: {
    name: { __type: "String" },
    templatePacks: { __type: "[String]" },
  },
  CommandSchematicPage: {
    __typename: { __type: "String!" },
    edges: { __type: "JSON" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    nodes: { __type: "JSON" },
    rank: { __type: "String" },
    template: { __type: "CommandSchematicPageTemplate" },
  },
  CommandSchematicPageInput: {
    edges: { __type: "JSON" },
    name: { __type: "String" },
    nodes: { __type: "JSON" },
    templateId: { __type: "String" },
  },
  CommandSchematicPageTemplate: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    name: { __type: "String" },
    nodes: { __type: "JSON" },
  },
  CommandSchematicPageTemplateInput: {
    name: { __type: "String" },
    nodes: { __type: "JSON" },
  },
  CommandSchematicVersion: {
    __typename: { __type: "String!" },
    commit: { __type: "String" },
    createdAt: { __type: "DateTime" },
    createdBy: { __type: "HiveUser" },
    data: { __type: "JSON" },
    id: { __type: "ID" },
    rank: { __type: "Int" },
    schematic: { __type: "CommandSchematic" },
  },
  CommandSchematicVersionInput: { commit: { __type: "String" } },
  CommandSchematicWhere: { id: { __type: "ID" } },
  CommandTemplateEdge: {
    __typename: { __type: "String!" },
    from: { __type: "CommandTemplateIO" },
    id: { __type: "ID" },
    script: { __type: "String" },
    to: { __type: "CommandTemplateIO" },
  },
  CommandTemplateEdgeInput: {
    from: { __type: "ID" },
    script: { __type: "String" },
    to: { __type: "ID" },
  },
  CommandTemplateIO: {
    __typename: { __type: "String!" },
    id: { __type: "ID" },
    name: { __type: "String" },
    type: { __type: "String" },
  },
  CommandTemplateIOInput: {
    direction: { __type: "String" },
    name: { __type: "String" },
    type: { __type: "String" },
  },
  CommandTemplateTransformer: {
    __typename: { __type: "String!" },
    edges: { __type: "[CommandTemplateEdge]" },
    id: { __type: "ID" },
    inputs: { __type: "[CommandTemplateIO]" },
    name: { __type: "String" },
    outputs: { __type: "[CommandTemplateIO]" },
  },
  CommandTemplateTransformerInput: { name: { __type: "String" } },
  ConnectDevicesInput: {
    device: { __type: "ID" },
    deviceState: { __type: "ID" },
    id: { __type: "ID" },
    path: { __type: "String" },
  },
  DeviceAlarm: {
    __typename: { __type: "String!" },
    ack: { __type: "Boolean" },
    ackAt: { __type: "DateTime" },
    ackBy: { __type: "HiveUser" },
    cause: { __type: "CommandProgramAlarm" },
    createdAt: { __type: "DateTime" },
    id: { __type: "ID" },
    message: { __type: "String" },
    severity: { __type: "String" },
  },
  DeviceScreenInput: {
    developer: { __type: "Boolean" },
    name: { __type: "String" },
  },
  GraphResource: {
    __typename: { __type: "String!" },
    actions: { __type: "[String]" },
    fields: { __type: "[String]" },
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
  Point: {
    __typename: { __type: "String!" },
    x: { __type: "Float" },
    y: { __type: "Float" },
  },
  PointInput: { x: { __type: "Float" }, y: { __type: "Float" } },
  mutation: {
    __typename: { __type: "String!" },
    acknowledgeCommandDeviceAlarm: {
      __type: "Boolean",
      __args: { alarm: "ID", device: "ID" },
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
    createCommandAnalyticPage: {
      __type: "CommandAnalyticPage!",
      __args: { device: "ID", input: "CommandAnalyticPageInput!" },
    },
    createCommandDevice: {
      __type: "CommandDevice!",
      __args: { input: "CommandDeviceInput!" },
    },
    createCommandDeviceAnalytic: {
      __type: "CommandDeviceAnalytic",
      __args: { input: "CommandDeviceAnalyticInput", page: "ID" },
    },
    createCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", input: "MaintenanceWindowInput!" },
    },
    createCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { device: "ID", input: "CommandDeviceReportInput" },
    },
    createCommandDeviceReportField: {
      __type: "CommandDeviceReportField!",
      __args: { input: "CommandDeviceReportFieldInput!", report: "ID" },
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
    createCommandProgramAlarm: {
      __type: "CommandProgramAlarm",
      __args: { input: "CommandProgramAlarmInput", program: "ID" },
    },
    createCommandProgramAlarmPathway: {
      __type: "CommandProgramAlarmPathway",
      __args: { input: "CommandProgramAlarmPathwayInput", program: "ID" },
    },
    createCommandProgramComponent: {
      __type: "CommandProgramComponent",
      __args: { input: "CommandProgramComponentInput", program: "ID" },
    },
    createCommandProgramComponentFile: {
      __type: "CommandProgramComponentFile",
      __args: {
        component: "ID!",
        content: "String",
        path: "String",
        program: "ID!",
      },
    },
    createCommandProgramComponentProperty: {
      __type: "CommandProgramComponentFile",
      __args: {
        component: "ID!",
        key: "String",
        program: "ID!",
        scalar: "String",
        typeId: "String",
      },
    },
    createCommandProgramDataScope: {
      __type: "CommandProgramDataScope",
      __args: { input: "CommandProgramDataScopeInput", program: "ID" },
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
    createCommandProgramTag: {
      __type: "CommandProgramTag",
      __args: { input: "CommandProgramTagInput", program: "ID" },
    },
    createCommandProgramTemplate: {
      __type: "CommandTemplateTransformer",
      __args: { input: "CommandTemplateTransformerInput!", program: "ID!" },
    },
    createCommandProgramType: {
      __type: "CommandProgramType",
      __args: { input: "CommandProgramTypeInput", program: "ID" },
    },
    createCommandProgramTypeField: {
      __type: "CommandProgramTypeField",
      __args: { input: "CommandProgramTypeFieldInput", type: "ID" },
    },
    createCommandSchematic: {
      __type: "CommandSchematic!",
      __args: { input: "CommandSchematicInput!" },
    },
    createCommandSchematicPage: {
      __type: "CommandSchematicPage!",
      __args: { input: "CommandSchematicPageInput", schematic: "ID" },
    },
    createCommandSchematicPageTemplate: {
      __type: "CommandSchematicPageTemplate",
      __args: { input: "CommandSchematicPageTemplateInput", schematic: "ID" },
    },
    createCommandSchematicVersion: {
      __type: "String",
      __args: { id: "ID!", input: "CommandSchematicVersionInput" },
    },
    createCommandTemplateEdge: {
      __type: "CommandTemplateEdge",
      __args: { input: "CommandTemplateEdgeInput!", template: "ID!" },
    },
    createCommandTemplateIO: {
      __type: "CommandTemplateIO",
      __args: { input: "CommandTemplateIOInput!", template: "ID!" },
    },
    createDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", input: "DeviceScreenInput!" },
    },
    deleteCommandAnalyticPage: {
      __type: "CommandAnalyticPage!",
      __args: { device: "ID", id: "ID" },
    },
    deleteCommandDevice: {
      __type: "CommandDevice!",
      __args: { where: "CommandDeviceWhere!" },
    },
    deleteCommandDeviceAnalytic: {
      __type: "CommandDeviceAnalytic",
      __args: { id: "ID", page: "ID" },
    },
    deleteCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", id: "ID!" },
    },
    deleteCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { device: "ID", id: "ID" },
    },
    deleteCommandDeviceReportField: {
      __type: "CommandDeviceReportField!",
      __args: { id: "ID", report: "ID" },
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
    deleteCommandProgramAlarm: {
      __type: "CommandProgramAlarm",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramAlarmPathway: {
      __type: "CommandProgramAlarmPathway",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramComponent: {
      __type: "CommandProgramComponent",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramComponentFile: {
      __type: "CommandProgramComponentFile",
      __args: { component: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramComponentProperty: {
      __type: "CommandProgramComponentFile",
      __args: { component: "ID!", id: "ID!", program: "ID!" },
    },
    deleteCommandProgramDataScope: {
      __type: "CommandProgramDataScope",
      __args: { id: "ID!", program: "ID" },
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
    deleteCommandProgramTag: {
      __type: "CommandProgramTag",
      __args: { id: "ID!", program: "ID" },
    },
    deleteCommandProgramTemplate: {
      __type: "Boolean!",
      __args: { id: "ID!", program: "ID!" },
    },
    deleteCommandProgramType: {
      __type: "CommandProgramType",
      __args: { id: "ID", program: "ID" },
    },
    deleteCommandProgramTypeField: {
      __type: "CommandProgramTypeField",
      __args: { id: "ID", type: "ID" },
    },
    deleteCommandSchematic: { __type: "Boolean!", __args: { id: "ID!" } },
    deleteCommandSchematicPage: {
      __type: "Boolean!",
      __args: { id: "ID", schematic: "ID" },
    },
    deleteCommandSchematicPageTemplate: {
      __type: "Boolean!",
      __args: { id: "ID", schematic: "ID" },
    },
    deleteCommandTemplateEdge: {
      __type: "CommandTemplateEdge",
      __args: { id: "ID!", template: "ID!" },
    },
    deleteCommandTemplateIO: {
      __type: "CommandTemplateIO",
      __args: { id: "ID!", template: "ID!" },
    },
    deleteDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", id: "ID!" },
    },
    exportCommandSchematic: { __type: "String", __args: { id: "ID!" } },
    importCommandProgramTags: {
      __type: "[CommandProgramTag]",
      __args: {
        input: "[CommandProgramTagInput]",
        program: "ID",
        scope: "String",
      },
    },
    importCommandProgramTypes: {
      __type: "[CommandProgramType]",
      __args: {
        input: "[CommandProgramTypeInput]",
        program: "ID",
        scope: "String",
      },
    },
    unacknowledgeCommandDeviceAlarm: {
      __type: "Boolean",
      __args: { alarm: "ID", device: "ID" },
    },
    updateCommandAnalyticPage: {
      __type: "CommandAnalyticPage!",
      __args: { device: "ID", id: "ID", input: "CommandAnalyticPageInput!" },
    },
    updateCommandDevice: {
      __type: "CommandDevice!",
      __args: { input: "CommandDeviceInput!", where: "CommandDeviceWhere!" },
    },
    updateCommandDeviceAnalytic: {
      __type: "CommandDeviceAnalytic",
      __args: { id: "ID", input: "CommandDeviceAnalyticInput", page: "ID" },
    },
    updateCommandDeviceAnalyticGrid: {
      __type: "[CommandDeviceAnalytic]",
      __args: {
        device: "ID",
        grid: "[CommandDeviceAnalyticInput]",
        page: "ID",
      },
    },
    updateCommandDeviceMaintenanceWindow: {
      __type: "MaintenanceWindow!",
      __args: { device: "ID", id: "ID!", input: "MaintenanceWindowInput!" },
    },
    updateCommandDeviceReport: {
      __type: "CommandDeviceReport",
      __args: { device: "ID", id: "ID", input: "CommandDeviceReportInput" },
    },
    updateCommandDeviceReportField: {
      __type: "CommandDeviceReportField!",
      __args: {
        id: "ID",
        input: "CommandDeviceReportFieldInput!",
        report: "ID",
      },
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
    updateCommandProgramAlarm: {
      __type: "CommandProgramAlarm",
      __args: { id: "ID!", input: "CommandProgramAlarmInput", program: "ID" },
    },
    updateCommandProgramAlarmPathway: {
      __type: "CommandProgramAlarmPathway",
      __args: {
        id: "ID!",
        input: "CommandProgramAlarmPathwayInput",
        program: "ID",
      },
    },
    updateCommandProgramComponent: {
      __type: "CommandProgramComponent",
      __args: {
        id: "ID!",
        input: "CommandProgramComponentInput",
        program: "ID",
      },
    },
    updateCommandProgramComponentFile: {
      __type: "CommandProgramComponentFile",
      __args: {
        component: "ID!",
        content: "String",
        id: "ID!",
        path: "String",
        program: "ID!",
      },
    },
    updateCommandProgramComponentProperty: {
      __type: "CommandProgramComponentFile",
      __args: {
        component: "ID!",
        id: "ID!",
        key: "String",
        program: "ID!",
        scalar: "String",
        typeId: "String",
      },
    },
    updateCommandProgramDataScope: {
      __type: "CommandProgramDataScope",
      __args: {
        id: "ID!",
        input: "CommandProgramDataScopeInput",
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
    updateCommandProgramTag: {
      __type: "CommandProgramTag",
      __args: { id: "ID!", input: "CommandProgramTagInput", program: "ID" },
    },
    updateCommandProgramTemplate: {
      __type: "CommandTemplateTransformer",
      __args: {
        id: "ID!",
        input: "CommandTemplateTransformerInput!",
        program: "ID!",
      },
    },
    updateCommandProgramType: {
      __type: "CommandProgramType",
      __args: { id: "ID", input: "CommandProgramTypeInput", program: "ID" },
    },
    updateCommandProgramTypeField: {
      __type: "CommandProgramTypeField",
      __args: { id: "ID", input: "CommandProgramTypeFieldInput", type: "ID" },
    },
    updateCommandSchematic: {
      __type: "CommandSchematic!",
      __args: { id: "ID!", input: "CommandSchematicInput!" },
    },
    updateCommandSchematicPage: {
      __type: "CommandSchematicPage!",
      __args: { id: "ID", input: "CommandSchematicPageInput", schematic: "ID" },
    },
    updateCommandSchematicPageOrder: {
      __type: "Boolean",
      __args: {
        above: "String",
        below: "String",
        id: "String",
        schematic: "ID",
      },
    },
    updateCommandSchematicPageTemplate: {
      __type: "CommandSchematicPageTemplate",
      __args: {
        id: "ID",
        input: "CommandSchematicPageTemplateInput",
        schematic: "ID",
      },
    },
    updateCommandTemplateEdge: {
      __type: "CommandTemplateEdge",
      __args: {
        id: "ID!",
        input: "CommandTemplateEdgeInput!",
        template: "ID!",
      },
    },
    updateCommandTemplateIO: {
      __type: "CommandTemplateIO",
      __args: { id: "ID!", input: "CommandTemplateIOInput!", template: "ID!" },
    },
    updateDeviceScreen: {
      __type: "CommandDeviceScreen",
      __args: { device: "ID", id: "ID!", input: "DeviceScreenInput!" },
    },
  },
  query: {
    __typename: { __type: "String!" },
    _resources: { __type: "[GraphResource]" },
    _sdl: { __type: "String!" },
    commandDataScopePlugins: { __type: "[CommandDataScopePlugin]" },
    commandDevices: {
      __type: "[CommandDevice]!",
      __args: { where: "CommandDeviceWhere" },
    },
    commandInterfaceDevicePacks: {
      __type: "[CommandHMIDevicePack]",
      __args: { id: "ID", registered: "Boolean" },
    },
    commandInterfaceDevices: { __type: "[CommandHMIDevice!]!" },
    commandPrograms: {
      __type: "[CommandProgram]!",
      __args: { where: "CommandProgramWhere" },
    },
    commandSchematics: {
      __type: "[CommandSchematic]!",
      __args: { where: "CommandSchematicWhere" },
    },
    hash: { __type: "Hash", __args: { input: "String!" } },
  },
  subscription: {
    __typename: { __type: "String!" },
    watchingDevice: { __type: "[HiveUser]", __args: { device: "ID!" } },
  },
  [SchemaUnionsKey]: { CommandHMINodes: ["CommandHMIGroup", "CommandHMINode"] },
} as const;

export interface CommandAnalyticPage {
  __typename?: "CommandAnalyticPage";
  charts?: Maybe<Array<Maybe<CommandDeviceAnalytic>>>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDataScopePlugin {
  __typename?: "CommandDataScopePlugin";
  configuration?: Maybe<ScalarsEnums["JSON"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  module?: Maybe<ScalarsEnums["String"]>;
  name?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDataTransformer {
  __typename?: "CommandDataTransformer";
  configuration?: Maybe<Array<Maybe<CommandDataTransformerConfiguration>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  options?: Maybe<ScalarsEnums["JSON"]>;
  template?: Maybe<CommandTemplateTransformer>;
}

export interface CommandDataTransformerConfiguration {
  __typename?: "CommandDataTransformerConfiguration";
  field?: Maybe<CommandTemplateIO>;
  id?: Maybe<ScalarsEnums["ID"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandDevice {
  __typename?: "CommandDevice";
  activeProgram?: Maybe<CommandProgram>;
  alarms?: Maybe<Array<Maybe<DeviceAlarm>>>;
  analyticPages: (args?: {
    where?: Maybe<CommandAnalyticPageWhere>;
  }) => Maybe<Array<Maybe<CommandAnalyticPage>>>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  dataLayout?: Maybe<ScalarsEnums["JSON"]>;
  deviceSnapshot: (args?: {
    where?: Maybe<CommandDeviceSnapshotWhere>;
  }) => Maybe<Array<Maybe<CommandDeviceSnapshot>>>;
  id: ScalarsEnums["ID"];
  lastSeen?: Maybe<ScalarsEnums["DateTime"]>;
  maintenanceWindows?: Maybe<Array<Maybe<MaintenanceWindow>>>;
  name?: Maybe<ScalarsEnums["String"]>;
  network_name?: Maybe<ScalarsEnums["String"]>;
  online?: Maybe<ScalarsEnums["Boolean"]>;
  operatingMode?: Maybe<ScalarsEnums["String"]>;
  operatingState?: Maybe<ScalarsEnums["String"]>;
  organisation?: Maybe<HiveOrganisation>;
  provisionCode?: Maybe<ScalarsEnums["String"]>;
  provisioned?: Maybe<ScalarsEnums["Boolean"]>;
  reports?: Maybe<Array<Maybe<CommandDeviceReport>>>;
  screens?: Maybe<Array<Maybe<CommandDeviceScreen>>>;
  watching?: Maybe<Array<Maybe<HiveUser>>>;
}

export interface CommandDeviceAnalytic {
  __typename?: "CommandDeviceAnalytic";
  device?: Maybe<CommandDevice>;
  height?: Maybe<ScalarsEnums["Int"]>;
  id: ScalarsEnums["ID"];
  subkey?: Maybe<CommandProgramTypeField>;
  tag?: Maybe<CommandProgramTag>;
  timeBucket?: Maybe<ScalarsEnums["String"]>;
  total?: Maybe<ScalarsEnums["Boolean"]>;
  totalValue: (args?: {
    endDate?: Maybe<Scalars["DateTime"]>;
    startDate?: Maybe<Scalars["DateTime"]>;
  }) => Maybe<CommandDeviceTimeseriesTotal>;
  type?: Maybe<ScalarsEnums["String"]>;
  unit?: Maybe<ScalarsEnums["String"]>;
  values: (args?: {
    endDate?: Maybe<Scalars["DateTime"]>;
    format?: Maybe<Scalars["String"]>;
    startDate?: Maybe<Scalars["DateTime"]>;
  }) => Maybe<Array<Maybe<CommandDeviceTimeseriesData>>>;
  width?: Maybe<ScalarsEnums["Int"]>;
  x?: Maybe<ScalarsEnums["Int"]>;
  y?: Maybe<ScalarsEnums["Int"]>;
}

export interface CommandDeviceReport {
  __typename?: "CommandDeviceReport";
  device?: Maybe<CommandDevice>;
  fields?: Maybe<Array<Maybe<CommandDeviceReportField>>>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  recurring?: Maybe<ScalarsEnums["Boolean"]>;
  reportLength?: Maybe<ScalarsEnums["String"]>;
  startDate?: Maybe<ScalarsEnums["DateTime"]>;
}

export interface CommandDeviceReportField {
  __typename?: "CommandDeviceReportField";
  bucket?: Maybe<ScalarsEnums["String"]>;
  device?: Maybe<CommandProgramTag>;
  id: ScalarsEnums["ID"];
  key?: Maybe<CommandProgramTypeField>;
}

export interface CommandDeviceScreen {
  __typename?: "CommandDeviceScreen";
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  device?: Maybe<CommandDevice>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  provisionCode?: Maybe<ScalarsEnums["String"]>;
  provisioned?: Maybe<ScalarsEnums["Boolean"]>;
}

export interface CommandDeviceSnapshot {
  __typename?: "CommandDeviceSnapshot";
  key?: Maybe<ScalarsEnums["String"]>;
  lastUpdated?: Maybe<ScalarsEnums["DateTime"]>;
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
  dataTransformer?: Maybe<CommandDataTransformer>;
  flow?: Maybe<Array<Maybe<CommandProgramHMI>>>;
  height?: Maybe<ScalarsEnums["Float"]>;
  id: ScalarsEnums["ID"];
  inputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  options?: Maybe<ScalarsEnums["JSONObject"]>;
  outputs?: Maybe<Array<Maybe<CommandHMINode>>>;
  ports?: Maybe<Array<Maybe<CommandHMIPort>>>;
  rotation?: Maybe<ScalarsEnums["Float"]>;
  scaleX?: Maybe<ScalarsEnums["Float"]>;
  scaleY?: Maybe<ScalarsEnums["Float"]>;
  showTotalizer?: Maybe<ScalarsEnums["Boolean"]>;
  type?: Maybe<ScalarsEnums["String"]>;
  width?: Maybe<ScalarsEnums["Float"]>;
  x?: Maybe<ScalarsEnums["Float"]>;
  y?: Maybe<ScalarsEnums["Float"]>;
  zIndex?: Maybe<ScalarsEnums["Float"]>;
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

export interface CommandKeyValue {
  __typename?: "CommandKeyValue";
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  value?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgram {
  __typename?: "CommandProgram";
  alarmPathways?: Maybe<Array<Maybe<CommandProgramAlarmPathway>>>;
  alarms?: Maybe<Array<Maybe<CommandProgramAlarm>>>;
  components: (args?: {
    where?: Maybe<CommandProgramComponentWhere>;
  }) => Maybe<Array<Maybe<CommandProgramComponent>>>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  dataScopes?: Maybe<Array<Maybe<CommandProgramDataScope>>>;
  id: ScalarsEnums["ID"];
  interface?: Maybe<Array<Maybe<CommandProgramHMI>>>;
  localHomepage?: Maybe<CommandProgramHMI>;
  name?: Maybe<ScalarsEnums["String"]>;
  organisation?: Maybe<HiveOrganisation>;
  remoteHomepage?: Maybe<CommandProgramHMI>;
  tags?: Maybe<Array<Maybe<CommandProgramTag>>>;
  templatePacks?: Maybe<Array<Maybe<CommandHMIDevicePack>>>;
  templates?: Maybe<Array<Maybe<CommandTemplateTransformer>>>;
  types?: Maybe<Array<Maybe<CommandProgramType>>>;
  usedOn?: Maybe<CommandDevice>;
  worldOptions?: Maybe<ScalarsEnums["JSON"]>;
}

export interface CommandProgramAlarm {
  __typename?: "CommandProgramAlarm";
  compileError?: Maybe<ScalarsEnums["Boolean"]>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  rank?: Maybe<ScalarsEnums["String"]>;
  script?: Maybe<ScalarsEnums["String"]>;
  title?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramAlarmPathway {
  __typename?: "CommandProgramAlarmPathway";
  compileError?: Maybe<ScalarsEnums["Boolean"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  scope?: Maybe<ScalarsEnums["String"]>;
  script?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramComponent {
  __typename?: "CommandProgramComponent";
  description?: Maybe<ScalarsEnums["String"]>;
  files?: Maybe<Array<Maybe<CommandProgramComponentFile>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  main?: Maybe<CommandProgramComponentFile>;
  name?: Maybe<ScalarsEnums["String"]>;
  program?: Maybe<CommandProgram>;
  properties?: Maybe<Array<Maybe<CommandProgramComponentProperty>>>;
}

export interface CommandProgramComponentFile {
  __typename?: "CommandProgramComponentFile";
  content?: Maybe<ScalarsEnums["String"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  path?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramComponentProperty {
  __typename?: "CommandProgramComponentProperty";
  id?: Maybe<ScalarsEnums["ID"]>;
  key?: Maybe<ScalarsEnums["String"]>;
  scalar?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<CommandProgramType>;
}

export interface CommandProgramDataScope {
  __typename?: "CommandProgramDataScope";
  configuration?: Maybe<ScalarsEnums["JSON"]>;
  description?: Maybe<ScalarsEnums["String"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  plugin?: Maybe<CommandDataScopePlugin>;
  program?: Maybe<CommandProgram>;
}

export interface CommandProgramHMI {
  __typename?: "CommandProgramHMI";
  edges?: Maybe<Array<Maybe<CommandHMIEdge>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  localHomepage?: Maybe<ScalarsEnums["Boolean"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  nodes?: Maybe<Array<Maybe<CommandHMINode>>>;
  programs?: Maybe<Array<Maybe<CommandProgram>>>;
  remoteHomepage?: Maybe<ScalarsEnums["Boolean"]>;
}

export interface CommandProgramTag {
  __typename?: "CommandProgramTag";
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  scope?: Maybe<CommandProgramDataScope>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandProgramType {
  __typename?: "CommandProgramType";
  fields?: Maybe<Array<Maybe<CommandProgramTypeField>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  usedByTag?: Maybe<Array<Maybe<CommandProgramTag>>>;
}

export interface CommandProgramTypeField {
  __typename?: "CommandProgramTypeField";
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandSchematic {
  __typename?: "CommandSchematic";
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  organisation?: Maybe<HiveOrganisation>;
  pages?: Maybe<Array<Maybe<CommandSchematicPage>>>;
  templates?: Maybe<Array<Maybe<CommandSchematicPageTemplate>>>;
  versions?: Maybe<Array<Maybe<CommandSchematicVersion>>>;
}

export interface CommandSchematicPage {
  __typename?: "CommandSchematicPage";
  edges?: Maybe<ScalarsEnums["JSON"]>;
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  nodes?: Maybe<ScalarsEnums["JSON"]>;
  rank?: Maybe<ScalarsEnums["String"]>;
  template?: Maybe<CommandSchematicPageTemplate>;
}

export interface CommandSchematicPageTemplate {
  __typename?: "CommandSchematicPageTemplate";
  id: ScalarsEnums["ID"];
  name?: Maybe<ScalarsEnums["String"]>;
  nodes?: Maybe<ScalarsEnums["JSON"]>;
}

export interface CommandSchematicVersion {
  __typename?: "CommandSchematicVersion";
  commit?: Maybe<ScalarsEnums["String"]>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  createdBy?: Maybe<HiveUser>;
  data?: Maybe<ScalarsEnums["JSON"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  rank?: Maybe<ScalarsEnums["Int"]>;
  schematic?: Maybe<CommandSchematic>;
}

export interface CommandTemplateEdge {
  __typename?: "CommandTemplateEdge";
  from?: Maybe<CommandTemplateIO>;
  id?: Maybe<ScalarsEnums["ID"]>;
  script?: Maybe<ScalarsEnums["String"]>;
  to?: Maybe<CommandTemplateIO>;
}

export interface CommandTemplateIO {
  __typename?: "CommandTemplateIO";
  id?: Maybe<ScalarsEnums["ID"]>;
  name?: Maybe<ScalarsEnums["String"]>;
  type?: Maybe<ScalarsEnums["String"]>;
}

export interface CommandTemplateTransformer {
  __typename?: "CommandTemplateTransformer";
  edges?: Maybe<Array<Maybe<CommandTemplateEdge>>>;
  id?: Maybe<ScalarsEnums["ID"]>;
  inputs?: Maybe<Array<Maybe<CommandTemplateIO>>>;
  name?: Maybe<ScalarsEnums["String"]>;
  outputs?: Maybe<Array<Maybe<CommandTemplateIO>>>;
}

export interface DeviceAlarm {
  __typename?: "DeviceAlarm";
  ack?: Maybe<ScalarsEnums["Boolean"]>;
  ackAt?: Maybe<ScalarsEnums["DateTime"]>;
  ackBy?: Maybe<HiveUser>;
  cause?: Maybe<CommandProgramAlarm>;
  createdAt?: Maybe<ScalarsEnums["DateTime"]>;
  id?: Maybe<ScalarsEnums["ID"]>;
  message?: Maybe<ScalarsEnums["String"]>;
  severity?: Maybe<ScalarsEnums["String"]>;
}

export interface GraphResource {
  __typename?: "GraphResource";
  actions?: Maybe<Array<Maybe<ScalarsEnums["String"]>>>;
  fields?: Maybe<Array<Maybe<ScalarsEnums["String"]>>>;
  name?: Maybe<ScalarsEnums["String"]>;
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
  acknowledgeCommandDeviceAlarm: (args?: {
    alarm?: Maybe<Scalars["ID"]>;
    device?: Maybe<Scalars["ID"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  changeDeviceValue: (args?: {
    deviceId?: Maybe<Scalars["String"]>;
    deviceName?: Maybe<Scalars["String"]>;
    key?: Maybe<Scalars["String"]>;
    value?: Maybe<Scalars["String"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  createCommandAnalyticPage: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: CommandAnalyticPageInput;
  }) => CommandAnalyticPage;
  createCommandDevice: (args: { input: CommandDeviceInput }) => CommandDevice;
  createCommandDeviceAnalytic: (args?: {
    input?: Maybe<CommandDeviceAnalyticInput>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceAnalytic>;
  createCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: MaintenanceWindowInput;
  }) => MaintenanceWindow;
  createCommandDeviceReport: (args?: {
    device?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandDeviceReportInput>;
  }) => Maybe<CommandDeviceReport>;
  createCommandDeviceReportField: (args: {
    input: CommandDeviceReportFieldInput;
    report?: Maybe<Scalars["ID"]>;
  }) => CommandDeviceReportField;
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
  createCommandProgramAlarm: (args?: {
    input?: Maybe<CommandProgramAlarmInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarm>;
  createCommandProgramAlarmPathway: (args?: {
    input?: Maybe<CommandProgramAlarmPathwayInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarmPathway>;
  createCommandProgramComponent: (args?: {
    input?: Maybe<CommandProgramComponentInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramComponent>;
  createCommandProgramComponentFile: (args: {
    component: Scalars["ID"];
    content?: Maybe<Scalars["String"]>;
    path?: Maybe<Scalars["String"]>;
    program: Scalars["ID"];
  }) => Maybe<CommandProgramComponentFile>;
  createCommandProgramComponentProperty: (args: {
    component: Scalars["ID"];
    key?: Maybe<Scalars["String"]>;
    program: Scalars["ID"];
    scalar?: Maybe<Scalars["String"]>;
    typeId?: Maybe<Scalars["String"]>;
  }) => Maybe<CommandProgramComponentFile>;
  createCommandProgramDataScope: (args?: {
    input?: Maybe<CommandProgramDataScopeInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramDataScope>;
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
  createCommandProgramTag: (args?: {
    input?: Maybe<CommandProgramTagInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTag>;
  createCommandProgramTemplate: (args: {
    input: CommandTemplateTransformerInput;
    program: Scalars["ID"];
  }) => Maybe<CommandTemplateTransformer>;
  createCommandProgramType: (args?: {
    input?: Maybe<CommandProgramTypeInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramType>;
  createCommandProgramTypeField: (args?: {
    input?: Maybe<CommandProgramTypeFieldInput>;
    type?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTypeField>;
  createCommandSchematic: (args: {
    input: CommandSchematicInput;
  }) => CommandSchematic;
  createCommandSchematicPage: (args?: {
    input?: Maybe<CommandSchematicPageInput>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => CommandSchematicPage;
  createCommandSchematicPageTemplate: (args?: {
    input?: Maybe<CommandSchematicPageTemplateInput>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandSchematicPageTemplate>;
  createCommandSchematicVersion: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandSchematicVersionInput>;
  }) => Maybe<ScalarsEnums["String"]>;
  createCommandTemplateEdge: (args: {
    input: CommandTemplateEdgeInput;
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateEdge>;
  createCommandTemplateIO: (args: {
    input: CommandTemplateIOInput;
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateIO>;
  createDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    input: DeviceScreenInput;
  }) => Maybe<CommandDeviceScreen>;
  deleteCommandAnalyticPage: (args?: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
  }) => CommandAnalyticPage;
  deleteCommandDevice: (args: { where: CommandDeviceWhere }) => CommandDevice;
  deleteCommandDeviceAnalytic: (args?: {
    id?: Maybe<Scalars["ID"]>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceAnalytic>;
  deleteCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
  }) => MaintenanceWindow;
  deleteCommandDeviceReport: (args?: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceReport>;
  deleteCommandDeviceReportField: (args?: {
    id?: Maybe<Scalars["ID"]>;
    report?: Maybe<Scalars["ID"]>;
  }) => CommandDeviceReportField;
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
  deleteCommandProgramAlarm: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarm>;
  deleteCommandProgramAlarmPathway: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarmPathway>;
  deleteCommandProgramComponent: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramComponent>;
  deleteCommandProgramComponentFile: (args: {
    component: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => Maybe<CommandProgramComponentFile>;
  deleteCommandProgramComponentProperty: (args: {
    component: Scalars["ID"];
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => Maybe<CommandProgramComponentFile>;
  deleteCommandProgramDataScope: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramDataScope>;
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
  deleteCommandProgramTag: (args: {
    id: Scalars["ID"];
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTag>;
  deleteCommandProgramTemplate: (args: {
    id: Scalars["ID"];
    program: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandProgramType: (args?: {
    id?: Maybe<Scalars["ID"]>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramType>;
  deleteCommandProgramTypeField: (args?: {
    id?: Maybe<Scalars["ID"]>;
    type?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTypeField>;
  deleteCommandSchematic: (args: {
    id: Scalars["ID"];
  }) => ScalarsEnums["Boolean"];
  deleteCommandSchematicPage: (args?: {
    id?: Maybe<Scalars["ID"]>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandSchematicPageTemplate: (args?: {
    id?: Maybe<Scalars["ID"]>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => ScalarsEnums["Boolean"];
  deleteCommandTemplateEdge: (args: {
    id: Scalars["ID"];
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateEdge>;
  deleteCommandTemplateIO: (args: {
    id: Scalars["ID"];
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateIO>;
  deleteDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
  }) => Maybe<CommandDeviceScreen>;
  exportCommandSchematic: (args: {
    id: Scalars["ID"];
  }) => Maybe<ScalarsEnums["String"]>;
  importCommandProgramTags: (args?: {
    input?: Maybe<Array<Maybe<CommandProgramTagInput>>>;
    program?: Maybe<Scalars["ID"]>;
    scope?: Maybe<Scalars["String"]>;
  }) => Maybe<Array<Maybe<CommandProgramTag>>>;
  importCommandProgramTypes: (args?: {
    input?: Maybe<Array<Maybe<CommandProgramTypeInput>>>;
    program?: Maybe<Scalars["ID"]>;
    scope?: Maybe<Scalars["String"]>;
  }) => Maybe<Array<Maybe<CommandProgramType>>>;
  unacknowledgeCommandDeviceAlarm: (args?: {
    alarm?: Maybe<Scalars["ID"]>;
    device?: Maybe<Scalars["ID"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  updateCommandAnalyticPage: (args: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input: CommandAnalyticPageInput;
  }) => CommandAnalyticPage;
  updateCommandDevice: (args: {
    input: CommandDeviceInput;
    where: CommandDeviceWhere;
  }) => CommandDevice;
  updateCommandDeviceAnalytic: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandDeviceAnalyticInput>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandDeviceAnalytic>;
  updateCommandDeviceAnalyticGrid: (args?: {
    device?: Maybe<Scalars["ID"]>;
    grid?: Maybe<Array<Maybe<CommandDeviceAnalyticInput>>>;
    page?: Maybe<Scalars["ID"]>;
  }) => Maybe<Array<Maybe<CommandDeviceAnalytic>>>;
  updateCommandDeviceMaintenanceWindow: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: MaintenanceWindowInput;
  }) => MaintenanceWindow;
  updateCommandDeviceReport: (args?: {
    device?: Maybe<Scalars["ID"]>;
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandDeviceReportInput>;
  }) => Maybe<CommandDeviceReport>;
  updateCommandDeviceReportField: (args: {
    id?: Maybe<Scalars["ID"]>;
    input: CommandDeviceReportFieldInput;
    report?: Maybe<Scalars["ID"]>;
  }) => CommandDeviceReportField;
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
  updateCommandProgramAlarm: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandProgramAlarmInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarm>;
  updateCommandProgramAlarmPathway: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandProgramAlarmPathwayInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramAlarmPathway>;
  updateCommandProgramComponent: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandProgramComponentInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramComponent>;
  updateCommandProgramComponentFile: (args: {
    component: Scalars["ID"];
    content?: Maybe<Scalars["String"]>;
    id: Scalars["ID"];
    path?: Maybe<Scalars["String"]>;
    program: Scalars["ID"];
  }) => Maybe<CommandProgramComponentFile>;
  updateCommandProgramComponentProperty: (args: {
    component: Scalars["ID"];
    id: Scalars["ID"];
    key?: Maybe<Scalars["String"]>;
    program: Scalars["ID"];
    scalar?: Maybe<Scalars["String"]>;
    typeId?: Maybe<Scalars["String"]>;
  }) => Maybe<CommandProgramComponentFile>;
  updateCommandProgramDataScope: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandProgramDataScopeInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramDataScope>;
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
  updateCommandProgramTag: (args: {
    id: Scalars["ID"];
    input?: Maybe<CommandProgramTagInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTag>;
  updateCommandProgramTemplate: (args: {
    id: Scalars["ID"];
    input: CommandTemplateTransformerInput;
    program: Scalars["ID"];
  }) => Maybe<CommandTemplateTransformer>;
  updateCommandProgramType: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandProgramTypeInput>;
    program?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramType>;
  updateCommandProgramTypeField: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandProgramTypeFieldInput>;
    type?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandProgramTypeField>;
  updateCommandSchematic: (args: {
    id: Scalars["ID"];
    input: CommandSchematicInput;
  }) => CommandSchematic;
  updateCommandSchematicPage: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandSchematicPageInput>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => CommandSchematicPage;
  updateCommandSchematicPageOrder: (args?: {
    above?: Maybe<Scalars["String"]>;
    below?: Maybe<Scalars["String"]>;
    id?: Maybe<Scalars["String"]>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => Maybe<ScalarsEnums["Boolean"]>;
  updateCommandSchematicPageTemplate: (args?: {
    id?: Maybe<Scalars["ID"]>;
    input?: Maybe<CommandSchematicPageTemplateInput>;
    schematic?: Maybe<Scalars["ID"]>;
  }) => Maybe<CommandSchematicPageTemplate>;
  updateCommandTemplateEdge: (args: {
    id: Scalars["ID"];
    input: CommandTemplateEdgeInput;
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateEdge>;
  updateCommandTemplateIO: (args: {
    id: Scalars["ID"];
    input: CommandTemplateIOInput;
    template: Scalars["ID"];
  }) => Maybe<CommandTemplateIO>;
  updateDeviceScreen: (args: {
    device?: Maybe<Scalars["ID"]>;
    id: Scalars["ID"];
    input: DeviceScreenInput;
  }) => Maybe<CommandDeviceScreen>;
}

export interface Query {
  __typename?: "Query";
  _resources?: Maybe<Array<Maybe<GraphResource>>>;
  _sdl: ScalarsEnums["String"];
  commandDataScopePlugins?: Maybe<Array<Maybe<CommandDataScopePlugin>>>;
  commandDevices: (args?: {
    where?: Maybe<CommandDeviceWhere>;
  }) => Array<Maybe<CommandDevice>>;
  commandInterfaceDevicePacks: (args?: {
    id?: Maybe<Scalars["ID"]>;
    registered?: Maybe<Scalars["Boolean"]>;
  }) => Maybe<Array<Maybe<CommandHMIDevicePack>>>;
  commandInterfaceDevices: Array<CommandHMIDevice>;
  commandPrograms: (args?: {
    where?: Maybe<CommandProgramWhere>;
  }) => Array<Maybe<CommandProgram>>;
  commandSchematics: (args?: {
    where?: Maybe<CommandSchematicWhere>;
  }) => Array<Maybe<CommandSchematic>>;
  hash: (args: { input: Scalars["String"] }) => Maybe<ScalarsEnums["Hash"]>;
}

export interface Subscription {
  __typename?: "Subscription";
  watchingDevice: (args: {
    device: Scalars["ID"];
  }) => Maybe<Array<Maybe<HiveUser>>>;
}

export interface SchemaObjectTypes {
  CommandAnalyticPage: CommandAnalyticPage;
  CommandDataScopePlugin: CommandDataScopePlugin;
  CommandDataTransformer: CommandDataTransformer;
  CommandDataTransformerConfiguration: CommandDataTransformerConfiguration;
  CommandDevice: CommandDevice;
  CommandDeviceAnalytic: CommandDeviceAnalytic;
  CommandDeviceReport: CommandDeviceReport;
  CommandDeviceReportField: CommandDeviceReportField;
  CommandDeviceScreen: CommandDeviceScreen;
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
  CommandKeyValue: CommandKeyValue;
  CommandProgram: CommandProgram;
  CommandProgramAlarm: CommandProgramAlarm;
  CommandProgramAlarmPathway: CommandProgramAlarmPathway;
  CommandProgramComponent: CommandProgramComponent;
  CommandProgramComponentFile: CommandProgramComponentFile;
  CommandProgramComponentProperty: CommandProgramComponentProperty;
  CommandProgramDataScope: CommandProgramDataScope;
  CommandProgramHMI: CommandProgramHMI;
  CommandProgramTag: CommandProgramTag;
  CommandProgramType: CommandProgramType;
  CommandProgramTypeField: CommandProgramTypeField;
  CommandSchematic: CommandSchematic;
  CommandSchematicPage: CommandSchematicPage;
  CommandSchematicPageTemplate: CommandSchematicPageTemplate;
  CommandSchematicVersion: CommandSchematicVersion;
  CommandTemplateEdge: CommandTemplateEdge;
  CommandTemplateIO: CommandTemplateIO;
  CommandTemplateTransformer: CommandTemplateTransformer;
  DeviceAlarm: DeviceAlarm;
  GraphResource: GraphResource;
  HiveOrganisation: HiveOrganisation;
  HiveUser: HiveUser;
  MaintenanceWindow: MaintenanceWindow;
  Mutation: Mutation;
  Point: Point;
  Query: Query;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames =
  | "CommandAnalyticPage"
  | "CommandDataScopePlugin"
  | "CommandDataTransformer"
  | "CommandDataTransformerConfiguration"
  | "CommandDevice"
  | "CommandDeviceAnalytic"
  | "CommandDeviceReport"
  | "CommandDeviceReportField"
  | "CommandDeviceScreen"
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
  | "CommandKeyValue"
  | "CommandProgram"
  | "CommandProgramAlarm"
  | "CommandProgramAlarmPathway"
  | "CommandProgramComponent"
  | "CommandProgramComponentFile"
  | "CommandProgramComponentProperty"
  | "CommandProgramDataScope"
  | "CommandProgramHMI"
  | "CommandProgramTag"
  | "CommandProgramType"
  | "CommandProgramTypeField"
  | "CommandSchematic"
  | "CommandSchematicPage"
  | "CommandSchematicPageTemplate"
  | "CommandSchematicVersion"
  | "CommandTemplateEdge"
  | "CommandTemplateIO"
  | "CommandTemplateTransformer"
  | "DeviceAlarm"
  | "GraphResource"
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
