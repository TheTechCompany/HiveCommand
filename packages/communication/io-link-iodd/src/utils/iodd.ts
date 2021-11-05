import { parseString } from "xml2js"
import { XMLIODD, IODD, IODDBits, IODDFilter } from "../types"

export const parseIODD = async (iodd: string) : Promise<XMLIODD> => {
    return new Promise((resolve, reject) => {
        parseString(iodd, (err, result) => {
            if(err) return reject(err);
            resolve(result);
        })
    })
}
const intToBin = (int: number, length: number) => {
    return int.toString(2) //.padStart(length)
}

export const getWord = (iodd_wordlist: {id: string, value: string}[], lookup : string) => {
    return iodd_wordlist.find((a) => a.id == lookup)
}

export const convertIODD = (iodd: XMLIODD) : IODD => {
    const wordlist = iodd.IODevice.ExternalTextCollection[0].PrimaryLanguage[0].Text.map((x) => x.$)

    return {
        identity: {
            ...iodd.IODevice.ProfileBody[0].DeviceIdentity[0].$
        },
        gradient: iodd.IODevice.ProfileBody[0].DeviceFunction[0].UserInterface[0].MenuCollection[0].Menu.find((a) => a.$.id == "M_OR_DAMPING")?.VariableRef?.find((a) => a.$.variableId == "V_dAP")?.$.gradient || '1',
        function: {
            inputs: iodd.IODevice.ProfileBody[0].DeviceFunction[0].ProcessDataCollection[0].ProcessData[0].ProcessDataIn.map((y) => ({
                name: getWord(wordlist, y.Name[0].$.textId)?.value,
                struct: y.Datatype[0].RecordItem.map((x) => ({
                    name: getWord(wordlist, x.Name[0].$.textId)?.value,
                    bits: {
                        type: x.SimpleDatatype[0].$["xsi:type"],
                        length: x.SimpleDatatype[0].$.bitLength,
                        offset: x.$.bitOffset,
                        subindex: x.$.subindex
                    }
                }))
            })),
            outputs: (iodd.IODevice.ProfileBody[0].DeviceFunction[0].ProcessDataCollection[0].ProcessData[0].ProcessDataOut || []).map((y) => ({
                name: getWord(wordlist, y.Name[0].$.textId)?.value,
                struct: y.Datatype[0].RecordItem.map((x) => ({
                    name: getWord(wordlist, x.Name[0].$.textId)?.value,
                    bits: {
                        type: x.SimpleDatatype[0].$["xsi:type"],
                        length: x.SimpleDatatype[0].$.bitLength,
                        offset: x.$.bitOffset,
                        subindex: x.$.subindex
                    }
                }))
            }))
        }
        
    }
}

export const createFilter = (iodd: IODDBits[], gradient: number = 1) : IODDFilter => {

    return (value: string) => {
        let bin = toBinString(Buffer.from(value, 'hex'))

        let iodd_blob = iodd.map((bit) => {
            let offset = parseInt(bit.offset)
            let slice = bin.substring(bin.length - offset, bin.length - (offset + parseInt(bit.length || '0')))

            return {name: `${bit.name}-${bit.subindex}` || 'Name not found', value: binToInt(slice) * gradient}
        })
        
        let obj : any = {}

        iodd_blob.forEach((blob) => {
            obj[blob.name] = blob.value
        })
       return obj

    }
}


export const createGulper = (iodd: IODDBits[]) : IODDFilter => {

    return (value: {[key: string]: any}) => {

        //Current [0, 1]
        let values = iodd.sort((a,b ) => {
            let aOffset = parseInt(a.subindex)
            let bOffset = parseInt(b.subindex)
            return aOffset - bOffset
        }).map((bit) => {
            if(!bit.name) return;
            if(!bit.length) return;
            let length = parseInt(bit.length)
            let val = value[`${bit.name}-${bit.subindex}`] || 0

            console.log(val)

            return parseInt(val).toString(16).padStart(length / 4, '0').toUpperCase()

            //01, 011 -> [00000001, 00000011]
            // return intToBin(val, length)
        }).join('')

        console.log(values)

        return values

    }
}


const gulp = createGulper([{name: 'Test', offset: '16', type: "IntegerT", subindex: '1', length: '16'}, {name: 'Test2', type: "IntegerT", subindex: '2', offset: '0', length: '16'}])
const gulped = gulp({
    Test: 123,
    Test2: 124
})

console.log(gulped)
export const getBits = (input: string, bitOffset: number, bitLength: number) => {
    let binary = toBinString(Buffer.from(input, 'hex'))
    let substring = binary.substring(binary.length - bitOffset, binary.length - (bitOffset + bitLength))
    return substring;
}
/*
    let flow = bin.substring(bin.length - 16, bin.length - (16 + 16))
    let temp = bin.substring(bin.length - 2, bin.length - (2 + 14))

    console.log(data, binToInt(flow), binToInt(temp))
*/
    /*

    PV8003
    
    let temp = bin.substring(bin.length - 16, bin.length - (16 + 16))
    let pressure = bin.substring(bin.length - 48, bin.length - (48 + 16))
    console.log(data, binToInt(temp), pressure)
})
*/


const binToInt = (binString: string) => {
    return parseInt(binString, 2)
}

const toBinString = (bytes : Uint8Array) => {
  return bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '');
}
