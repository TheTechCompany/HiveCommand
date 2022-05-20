import { Socket } from "socket.io";
import jwt_decode from 'jwt-decode'
import { AUTH, HEARTBEAT, PROCESS_TRANSITION } from "./actions";
import { handleHeartbeat, handleTransition } from "./heartbeat";
import { PrismaClient } from "@hive-command/data";

export const handleSocket = (dataManager: PrismaClient, socket: Socket) => {
    let machine = (socket as any).networkName

    if(machine){
        console.log(`=> Machine Info`)
        console.log(machine)
    }

    socket.on(PROCESS_TRANSITION, async (data) => await handleTransition(socket, data))
    socket.on(HEARTBEAT, async (data) => await handleHeartbeat(socket, data))

}