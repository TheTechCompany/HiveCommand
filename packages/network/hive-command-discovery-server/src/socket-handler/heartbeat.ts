import { Socket } from "socket.io";


export const handleHeartbeat = async (socket: Socket, data: any) => {
    // console.log(`Heartbeat`, (socket as any).networkName)

    let id = (socket as any)?.networkName
   
    //TODO add graphql version
    // await dataManager.updateLiveness(id, true)
    
    // const device = await Device.findById(id)

    // if(device){
    //     s
    //     device.connected = true;
    //     device.lastSeen = new Date();
    //     await device.save();
    // }
}

export const handleTransition = async (socket: Socket, data: any) => {
    let id = (socket as any)?.networkName;

    //TODO add graphql version
    // await dataManager.updateProcess(id, {process: data.process, target: data.target})
}