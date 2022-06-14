import mongoose from 'mongoose'
export * from './DeviceValue'

export const connect_to = (url: string) => {
    mongoose.connect(url);
}