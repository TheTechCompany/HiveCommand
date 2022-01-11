import { Socket } from "socket.io";
import jwt_decode from 'jwt-decode'
import { AUTH, HEARTBEAT, PROCESS_TRANSITION } from "./actions";
import { handleAuthRequest } from "../utils/auth";
import { handleHeartbeat, handleTransition } from "./heartbeat";
import { HiveCommandData } from '@hive-command/data'

export const handleSocket = (dataManager: HiveCommandData, socket: Socket) => {
    let machine = (socket as any).networkName

    if(machine){
        console.log(`=> Machine Info`)
        console.log(machine)
    }

    socket.on(PROCESS_TRANSITION, async (data) => await handleTransition(dataManager, socket, data))
    socket.on(HEARTBEAT, async (data) => await handleHeartbeat(dataManager, socket, data))

}