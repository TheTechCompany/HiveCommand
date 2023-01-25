import { DeviceInfoApi, FieldBusApi, PortsApi, TreeResponse } from "@io-link/master-api";
import EventEmitter from "events";
import { nanoid } from "nanoid";

export class IOMaster extends EventEmitter {

    public id : string = nanoid()
    private url: string;

    private infoClient?: DeviceInfoApi;
    private portClient?: PortsApi;

    private fieldbusClient?: FieldBusApi;

    public tree?: TreeResponse;
    public product?: string;

    public serial?: string;

    public ports?: any[];

    constructor(ip: string){
        super();

        this.url = `http://${ip}`

        this.infoClient = new DeviceInfoApi(undefined, this.url)
        this.portClient = new PortsApi(undefined, this.url)
        this.fieldbusClient = new FieldBusApi(undefined, this.url);

        this.init();
    }

    private async init(){
        this.tree = await (await this.infoClient?.getTree())?.data
        this.product = await (await this.infoClient?.getProductCode())?.data.data?.value as any

        this.serial = (await this.infoClient?.getSerial())?.data.data?.value?.toString()

        this.emit('init')
    }

    async getIP(){
        return await this.fieldbusClient?.getFieldBusIP()
    }

    async setIP(ip: string) {
        return await this.fieldbusClient?.setFieldBusIP({
            code: 'request',
            adr: '/fieldbussetup/network/setblock',
            cid: 4,
            data: {
                datatoset: {
                    ipaddress: ip,
                    ipdefaultgateway: '0.0.0.0',
                    dhcp: 0,
                    subnetmask: '255.255.255.0'
                }
            }
        })
    }

    get num_ports(){
        let ioMaster = this.tree?.data?.subs?.find((a) => a.identifier == "iolinkmaster")
        let ports = ioMaster?.subs?.filter((a) => (a.identifier || '').indexOf('port') > -1) || []
        return ports.length;
    }

    public async scanPorts(){
        this.ports = [];
        for(var i = 0; i < this.num_ports; i++){
            const status = await (await this.portClient?.getPortStatus(i + 1))?.data.data?.value
    
            const product = await (await this.portClient?.getPortProduct(i + 1))?.data.data?.value
            
            const serial = (await this.portClient?.getPortSerial(i + 1))?.data.data?.value
            
            if(product){
                const vendorId = await (await this.portClient?.getPortVendorId(i+1))?.data.data?.value
                const deviceId = await (await this.portClient?.getPortDeviceId(i+1))?.data.data?.value
                
                this.ports?.push({ix: i, vendorId, deviceId, status, product, serial})
            }
            
        }
        return this.ports;
    }

    async getPortInfo(port: number): Promise<any> {
        return await this.portClient?.getPortSetting(port)
    }

    async readPort(port: number){
        const portData = await this.portClient?.getPortData(port)
        return portData?.data
    }

    async writePort(port: number, value: string){

        const setPortData = await this.portClient?.setPortData(port, {
            code: 'request',
            adr: `/iolinkmaster/port[${port}]/iolinkdevice/pdout/setdata`,
            cid: -1,
            data: {
                newvalue: value
            }
        })
        return setPortData?.data
    }

    
    getRandomInt(max: number){
        return Math.floor(Math.random() * max);
    }

    async unsubscribe(id: number, callbackUrl: string){
        const resp = await this.portClient?.unsubscribeFromPort(0, {
            code: 'request',
            adr: '/timer[1]/counter/datachanged/unsubscribe',
            cid: id,
            data: {
                callback: callbackUrl
            }
        })
        return resp?.data
    }

    async subscribeToPorts(ports: number[], callbackUrl?: string){
        const subscription_id = this.getRandomInt(2000);
        const resp = await this.portClient?.subcribeToPort(0, {
            adr: `/timer[1]/counter/datachanged/subscribe`,
            cid: subscription_id,
            code: 'request',
            data: {
                callback: callbackUrl,
                datatosend: ports.map((port) => {
                    return [
                        `/iolinkmaster/port[${port}]/iolinkdevice/pin2in`,
                        `/iolinkmaster/port[${port}]/iolinkdevice/pdin`,
                        `/iolinkmaster/port[${port}]/iolinkdevice/pdout`,
                        `/iolinkmaster/port[${port}]/iolinkdevice/productname`
                    ]
                }).reduce((prev, curr) => prev.concat(curr), []).concat([
                    `/processdatamaster/temperature`,
                ])
            }
        })
        return {
            id: subscription_id,
            result: resp?.data
        }
    }

    async subscribePort(port: number, callbackUrl?: string){
        console.log("Subscribing to port", port, callbackUrl)
        const resp = await this.portClient?.subcribeToPort(port, {       
            // adr: `/iolinkmaster/port[${port}]/iolinkdevice/iolinkevent/datachanged/subscribe`,
            adr: "/timer[1]/counter/datachanged/subscribe",
            cid: -1,
            code: "request",     
            data: {
                callback: callbackUrl || 'http://192.168.10.221:8090',
                datatosend: [
                    `/iolinkmaster/port[${port}]/iolinkdevice/pdin`,
                    `/iolinkmaster/port[${port}]/iolinkdevice/pin2in`,
                    `/processdatamaster/temperature`,
                    `/iolinkmaster/port[${port}]/iolinkdevice/productname`
                ]
            }
        })
        return resp?.data
    }
}