import { MQTTPublisher } from "@hive-command/opcua-mqtt";
import OPCUAClient from "@hive-command/opcua-client";
import { load_exports } from '../utils';
import { SidecarConf } from "./conf";
import { DataType } from "node-opcua";
import ts, { ModuleKind } from "typescript";
import { DataTypes, fromOPCType, parseValue } from "@hive-command/scripting";
import { EventEmitter } from 'events';
import { merge, isEqual } from 'lodash'

import { MQTTClient } from '@hive-command/opcua-mqtt-client'

export interface SidecarOptions {

    tags?: { name: string, type: string }[]
    types?: { name: string, fields: { name: string, type: string }[] }[]

    iot?: {
        host: string,
        user: string,
        pass: string
    }

    opcuaServer?: string;

    deviceMap?: {
        path: string,
        tag: string
    }[]

    subscriptionMap?: {
        path: string,
        tag: string
    }[]
}

export class Sidecar extends MQTTClient {

    private conf: SidecarConf;


    constructor(config?: SidecarOptions) {
        super(config);

        this.conf = new SidecarConf({ filename: 'hive-command.json', options: config });

    }



    getTagPaths(object: any, parent?: string): any {
        // console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    setConfig(options: SidecarOptions) {
        this.options = options;
        this.conf.updateConf(options)
    }

    getConfig() {
        return this.conf.getConf();
    }


}
