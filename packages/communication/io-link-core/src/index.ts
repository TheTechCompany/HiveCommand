import {
    DiagnosticsApi,
    IOTApi,
    PortsApi,
    DeviceInfoApi
} from '@io-link/master-api'

import IODDStore from '@io-link/iodd'

import { scanNetwork } from '@io-link/master-discovery'
import { IOMaster } from './master/IOMaster'

export {
    IOMaster
}

export const discoverMasters = async (device: string) => {
    console.log("Discovering IO Link on ", device)
    const networkDevices = await scanNetwork(device)
    console.log("Discovered", networkDevices)
    if(networkDevices.length == 0) return [];

    return await Promise.all<IOMaster>(networkDevices.map(async (device) => {
        const master = new IOMaster(device.ip)
        return await new Promise((resolve, reject) => {
            master.on('init', async () => {
                resolve(master)
            })
        })
     
    }))
}

export const discoverDevices = async (master: IOMaster) => {
    const ports = await master.scanPorts()

    const port_devices = [...new Set(ports.map((x) => `${x.vendorId}:${x.deviceId}`))]
    return {unique: port_devices, ports:  ports?.map((x) => ({...x, master: master.serial})) }
}

export const getIODD = async (ioddStore: IODDStore, device: string) => {
    const iodd = await ioddStore.lookupDevice(device)
    return iodd;
}
// (async () => {

//   /*  const ioddStore = new IODDStore({storagePath: __dirname + '/../'});

//     const networkDevices = await scanNetwork('eth0')

//     if(networkDevices.length > 0){
//         networkDevices.forEach((device) => {
            
//             const master = new IOMaster(device.ip)

//             master.on('init', async () => {
//                 const ports = await master.scanPorts();

//                     // console.log(vendor)
                
//                     // fs.writeFileSync(__dirname + '/vendor-table.xml', vendor)
//                 const port_devices = [...new Set(ports.map((x) => `${x.vendorId}:${x.deviceId}`))]
//                 port_devices.forEach(async (port) => {
//                     const iodd = await ioddStore.lookupDevice(port)

//                     console.log(iodd)
//                 })
            
//                 console.log(master.product, master.num_ports, ports)
//             })

//         })
//     }

//     console.log(`Found ${networkDevices.length} devices`)
//     */
//     const portClient = new PortsApi(undefined, "http://localhost:8080")
//     const infoClient = new DeviceInfoApi(undefined, "http://localhost:8080")

//     const tree = await infoClient.getTree()

//     const info = await infoClient.getProductCode()

//     console.log(`Product ${info.data.data?.value}`)

//     let ioMaster = tree.data.data?.subs?.find((a) => a.identifier == "iolinkmaster")

//     let ports = ioMaster?.subs?.filter((a) => (a.identifier || '').indexOf('port') > -1) || []

//     for(var i = 0; i < ports?.length; i++){
//         const status = await (await portClient.getPortStatus(i + 1)).data.data?.value

//         const product = await (await portClient.getPortProduct(i + 1)).data.data?.value

//         if(product){
//             const vendorId = await (await portClient.getPortVendorId(i+1)).data.data?.value
//             const deviceId = await (await portClient.getPortDeviceId(i+1)).data.data?.value
            
//             console.log(`${product} ${vendorId}:${deviceId}`)
//         }
//         console.log(`Port ${i+1} status: ${status} product ${product}`)
        
//     }

//     const val = await portClient.getPortData(7)

//     console.log(`Found ${ports?.length} ports, ${val.data.data?.value}`)
    
// })()