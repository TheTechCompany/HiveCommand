import { Socket } from "socket.io";
import { Models } from '@hive-command/data-types'
const { Device } = Models;

import { HiveCommandData } from '@hive-command/data'

export const handleHeartbeat = async (dataManager: HiveCommandData, socket: Socket, data: any) => {
    console.log(`Heartbeat`, (socket as any).networkName)

    let id = (socket as any)?.networkName
   
    await dataManager.updateLiveness(id, true)
    // const device = await Device.findById(id)

    // if(device){
    //     s
    //     device.connected = true;
    //     device.lastSeen = new Date();
    //     await device.save();
    // }
}

export const handleTransition = async (dataManager: HiveCommandData, socket: Socket, data: any) => {
    let id = (socket as any)?.networkName;

    await dataManager.updateProcess(id, {process: data.process, target: data.target})
}