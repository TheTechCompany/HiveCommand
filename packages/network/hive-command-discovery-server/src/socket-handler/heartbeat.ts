import { PrismaClient } from "@hive-command/data";
import { Socket } from "socket.io";


export const handleHeartbeat = async (dataManager: PrismaClient, socket: Socket, data: any) => {
    // console.log(`Heartbeat`, (socket as any).networkName)

    let id = (socket as any)?.networkName
   
    //TODO add graphql version
    // await dataManager.updateLiveness(id, true)
    
    // const device = await Device.findById(id)

    try{
        await dataManager.device.update({
            where: {
                network_name: id,
            },
            data: {
                online: true,
                lastSeen: new Date()
            }
        })
    }catch(e){
        console.log(e)
    }   
    // if(device){
    //     s
    //     device.connected = true;
    //     device.lastSeen = new Date();
    //     await device.save();
    // }
}

export const handleTransition = async (socket: Socket, data: any) => {
    let id = (socket as any)?.networkName;

    // await data
    //TODO add graphql version
    // await dataManager.updateProcess(id, {process: data.process, target: data.target})
}