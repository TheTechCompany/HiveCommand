import path from "path";
import fs from 'fs/promises'
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { getVendorIdTable, findIODD, downloadIODD, extractIODD, extractIODDXML, convertIODD, parseIODD, createFilter } from "./utils";
import { IODD } from "./types";

export * from './types'
export * from './utils'

export interface IODDStoreOptions {
    storagePath: string;
}

export default class IODDStore {
    
    private vendorTable? : {[key: string]: string};

    private deviceList : {
        [key: string]: {
            name: string, 
            version: string,
            iodd: string,
            ioLinkRev?: string,
            cached?: boolean
        }   
    } = {};

    private lookupQueue: string[] = [];

    private options: IODDStoreOptions;

    constructor(opts: IODDStoreOptions = {storagePath: path.join(__dirname + '/iodd')}){
        this.options = opts;
        this.init();
    }  

    async init(){
        if(this.options.storagePath && !existsSync(this.options.storagePath)){
            mkdirSync(this.options.storagePath)
        }
        this.vendorTable = await getVendorIdTable()
    }

    /**
     * Lookup device in IODD store (e.g. "310:610")
     * @param dev (vendor:device)
     */
    async lookupDevice(dev: string){

        const dev_parts = dev.split(':')
        if(dev_parts.length < 2) return;
        const vendorId = dev_parts[0];
        const deviceId = dev_parts[1];

        let device = this.deviceList[dev]
        if(!device) {

            if(existsSync(path.join(this.options.storagePath, `${dev}.xml`))){
                let info = readFileSync(path.join(this.options.storagePath, `${dev}.xml`), 'utf8')
                const xmliodd = await parseIODD(info)
                const iodd = convertIODD(xmliodd)

                device = {
                    name: '',
                    version: '',
                    ioLinkRev: '',
                    iodd: path.join(this.options.storagePath, `${dev}.xml`),
                    cached: true
                }

                this.deviceList[dev] = device
            }else{
                const iodd = await findIODD(this.vendorTable?.[vendorId], deviceId)
                
                const download = await downloadIODD(vendorId, iodd.ioddId)
                
                const defintion = await extractIODDXML(download)

                const writePath = path.join(this.options.storagePath, `${dev}.xml`)
                await fs.writeFile(writePath, defintion, 'utf8')
                
                device = {
                    name: iodd.productName,
                    version: iodd.versionString,
                    ioLinkRev: iodd.ioLinkRev,
                    iodd: writePath,
                    cached: true
                }

                this.deviceList[dev] = device
            }
        }
        return device;
    }

    async getIODD(path: string){
        const stringIodd = readFileSync(path, 'utf8')
        const xmlIodd = await parseIODD(stringIodd)
        const iodd = convertIODD(xmlIodd)
        return iodd;
    }

    async getIODDFilter(path: string){
        let iodd = await this.getIODD(path)
        let bits = iodd.function.inputs.map((feat) => {
            return feat.struct.map((x) => {
                x.bits.name = x.name;
                return x.bits
            })
        }).reduce((prev, curr) => prev.concat(curr), [])

        let filter = createFilter(bits)
        return filter
    }

}