import { Socket } from "socket.io";
import { Models } from '@hive-command/data-types'
const { Device, DNSRecord } = Models;
import jwt from 'jsonwebtoken'

export const getIP = (socket: Socket) => {
    return socket.handshake.address.replace('::ffff:', '')
}

export const handleAuthRequest = async (ip: string, data: {did?: string}) => {
    let device = await Device.findOne({did: data.did})
    if(device && process.env.NODE_ENV == 'dev'){
        let token = jwt.sign({
            id: device?._id,
            url: `localhost`
        }, "JWT")
        return {token}
    }
    if(device){
        let connection = await DNSRecord.findOne({address: ip, subdomain: device.network_name})
        let token = jwt.sign({
            id: device._id,
            url: `${connection?.subdomain}.${connection?.domain}`
        }, "JWT")
        //
        return {token}
    }
    return {error: "Device not found"}
}