import mongoose, { Schema } from 'mongoose'

export interface IDeviceValue {
    deviceId: string,
    placeholder: string,
    key: string,
    value: string,
    lastUpdated: Date
}

const deviceValueSchema = new Schema<IDeviceValue>({
    deviceId: String,
    placeholder: String,
    key: String,
    value: String,
    lastUpdated: Date
})

export const DeviceValue = mongoose.model('DeviceValue', deviceValueSchema)