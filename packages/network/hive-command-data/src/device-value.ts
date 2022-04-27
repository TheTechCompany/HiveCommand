import { IDevice } from './types'
import { model, Types, Document, Schema } from "mongoose";
import {nanoid} from 'nanoid';
//import { ProgramSchema } from './program'

const DeviceValueSchema: Schema = new Schema({
    device: {type: String},
    deviceId : {type: String},
    value : {type: String},
    valueKey : {type: String}
})


export default model<IDevice>('DeviceValue', DeviceValueSchema)
