import { DataScope, Alarm, AlarmPathway, HMITag, HMIType } from "@hive-command/interface-types";

export interface GDSNetworkLayout {
        deviceId: string

        dataScopes: DataScope[];

        alarmPathways: AlarmPathway[]

        iotEndpoint: string,
        iotSubject: string,
        iotUser: string,
        iotToken: string,
}

export interface GDSControlLayout {
    tags: HMITag[],
    types: HMIType[],
    alarms?: Alarm[]
}