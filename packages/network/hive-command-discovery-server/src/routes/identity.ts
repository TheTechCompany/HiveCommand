import { Router } from 'express';
import { handleAuthRequest } from '../utils/auth';
import { promises } from 'dns';
import { Data } from '../data';

export default (dataBroker: Data) => {
    const router = Router();

    router.get('/whoami', async (req, res) => {
        let ip = (req.ip || req.socket.remoteAddress)?.replace('::ffff:', '')
        if(!ip) return res.send({error: "No IP, strange"});
        const [host] = await promises.reverse(ip)

        res.send({
            identity: {
                named: host,
                address: ip
            }
        })
    })

    router.get(`/purpose`, async (req, res) => {
        let ip = (req.ip || req.socket.remoteAddress)?.replace('::ffff:', '')
        if(!ip) return res.send({error: "No IP, strange"});
        const [host] = await promises.reverse(ip)
       
        let deviceId = host?.replace(".hexhive.io", '')


        const payload = await dataBroker.getDeviceProgram(deviceId);

        // const [ commandPayload, deviceAssignment, deviceActions] = await Promise.all([
        //     dataBroker.getDeviceProgram(deviceId), 
        //     dataBroker.getDeviceAssignment(deviceId),
        //     dataBroker.getDeviceActions(deviceId),
        // ])
        


        res.send({payload: payload})
    })

    router.post('/context', async (req, res) => {
        let ip = (req.ip || req.socket.remoteAddress)?.replace('::ffff:', '')
        if(!ip) return res.send({error: "No IP, strange"});
        const [host] = await promises.reverse(ip)

        let deviceId = host?.replace(".hexhive.io", '')

        let identity = {
            uptime: req.body.identity.uptime,
            memory: req.body.identity.hardware.memory,
            os: req.body.identity.os.arch
        }

        let buses = req.body.buses;

        await dataBroker.updateDeviceUptime(deviceId, identity.uptime)

        await dataBroker.upsertDevicePeripherals(
            deviceId,
            buses
        )
        console.log(req.body, host);

        res.send({success: 200})
    })

    router.post('/', async (req, res) => {
        let ip = req.ip.replace('::ffff:', '')
        console.log("IP", ip)

        const response = await handleAuthRequest(ip, {did:req.body.did})
        if(response.error) return res.status(400).send(response)
        res.send(response)
    })


    return router;

}