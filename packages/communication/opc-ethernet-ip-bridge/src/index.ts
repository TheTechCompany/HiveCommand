import { ControllerManager, CIP, ManagedController, Tag, TagList, EthernetIP } from '@hive-command/ethernet-ip';


import EventEmitter from 'events'

import express from 'express'
import bodyParser from 'body-parser'

import OPCUAServer from '@hive-command/opcua-server'
import { addTag, TAG_TYPE } from './opc-server';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Types } from '@hive-command/ethernet-ip/dist/enip/cip/data-types';
import { EthernetIPBridge } from './bridge';

const READ_BUFFER_TIME = 200;

export * from './bridge'