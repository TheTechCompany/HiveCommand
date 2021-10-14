import axios from 'axios';
import fs from 'fs';
import { parseString } from 'xml2js'
import AdmZip, { IZipEntry } from 'adm-zip'


export * from './iodd'
// ifm%20electronic%20gmbh

export const getVendorIdTable = async () : Promise<{[key: string]: string}> => {
    return new Promise(async (resolve, reject) => {
        const vendorTable = (await axios.get(`https://io-link.com/share/Downloads/Vendor_ID_Table.xml`)).data
        parseString(vendorTable, (err, result) => {
            if(err) return reject(err)

            let manufacturers = result.Man_ID_Table.Manufacturer.map((item: any) => ({
                id: item.$.ID,
                info: item.ManufacturerInfo[0].ManufacturerName[0]
            }))

            let manufacturer_blob = manufacturers.reduce((obj: any, item: any) => {
                return {
                    ...obj,
                    [item.id]: item.info
                }
            }, {})

            return resolve(manufacturer_blob)
        })
    })
}

export const findIODD = async (vendorName?: string, deviceId?: string) => {
    let params = new URLSearchParams({})
    if(vendorName) params.set('vendorName', vendorName)
    if(deviceId) params.set('deviceIdString', deviceId)
    params.set('ioLinkRev', '1.1')

    const iodd_search = (await axios.get(`https://ioddfinder.io-link.com/api/drivers?${params.toString()}`)).data
    return iodd_search.content[0];
}

export const downloadIODD = async (vendorId?: string, ioddId?: string) => {
    const iodd = (await axios.get(`https://ioddfinder.io-link.com/api/vendors/${vendorId}/iodds/${ioddId}/files/zip/rated`, {responseType: 'arraybuffer'})).data
    
    return iodd;
   
}

export const extractIODD = async (iodd: Buffer, filter_fn: (entry: IZipEntry) => boolean) => {
    const zip = new AdmZip(iodd)

    const entries = zip.getEntries();

    return entries.filter(filter_fn).map((x) => {
        return zip.readAsText(x.entryName)
    })
}

export const extractIODDImages = async (iodd: Buffer) => {
    return await extractIODD(iodd, (entry) => {
            if(entry.entryName.indexOf('.png') > -1 || entry.entryName.indexOf('.xml') > -1){
               return true;
            }
            return false;
    })
}

export const extractIODDXML = async (iodd: Buffer) => {
    return await extractIODD(iodd, (entry) => {
        const match = entry.entryName.match(/IODD1\.1\.xml$/)
        
        return match != undefined && match.length > 0
    })
}

/*

getVendorIdTable().then((vendor: {[key: string]: string}) => {
    // console.log(vendor)

    // fs.writeFileSync(__dirname + '/vendor-table.xml', vendor)
    console.log(vendor['310'])
    findIODD(vendor['310'], '1211').then((iodd) => {

        downloadIODD(iodd.vendorId, iodd.ioddId)
        console.log(iodd)
    })
})*/