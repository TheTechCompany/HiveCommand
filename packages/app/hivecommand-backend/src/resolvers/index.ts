import { nanoid } from 'nanoid';
import { Session } from 'neo4j-driver';
import { Channel } from 'amqplib';
import { Pool } from 'pg';
import { getDeviceActions } from '../data';
import { DeviceValue } from '@hexhive/types'

import { OGM } from '@neo4j/graphql-ogm'
import {unit as mathUnit} from 'mathjs';
import { Driver } from 'neo4j-driver';
import moment from 'moment';
import { PrismaClient } from '@prisma/client';

const getProjection = (fieldASTs: any) => {
	const { selections } = fieldASTs.selectionSet;
	return selections.reduce((projs: any, selection: any) => {
	  switch (selection.kind) {
		case 'Field':
		  return {
			...projs,
			[selection.name.value]: 1
		  };
		case 'InlineFragment':
		  return {
			...projs,
			...getProjection(selection),
		  };
		default:
		  throw 'Unsupported query';
	  }
	}, {});
  }
