import { DataType, makeEUInformation, Namespace, standardUnits } from "node-opcua";
import { EUInformation } from 'node-opcua-types'

const baseSensor = (namespace: Namespace, name: string, units: EUInformation, unitRange: {low: number, high: number}) => {
    const sensor = namespace.addObjectType({
        browseName: name,
    })

    namespace.addAnalogDataItem({
        browseName: "Output",
        engineeringUnits: units,
        engineeringUnitsRange: unitRange,
        dataType: DataType.Double,
        componentOf: sensor,
        modellingRule: "Mandatory"
    })
    return sensor;
}


export default (namespace: Namespace) => {

    let flowSensor = baseSensor(
        namespace, 
        'FlowSensor',
        makeEUInformation('l/min', 'liters/minute', 'liters per minute'),
        {low: -100, high: 200})
    let pressureSensor = baseSensor(
        namespace, 
        "PressureSensor", 
        standardUnits.bar,
        {low: -1, high: 2})
    let levelSensor = baseSensor(
        namespace, 
        "LevelSensor", 
        standardUnits.bar,
        {low: -1, high: 2})
    let conductivitySensor = baseSensor(
        namespace, 
        "Conductivity", 
        makeEUInformation('µS', 'mSiemens', 'microSiemens'),
        {low: 0, high: 20000}) 
    
    return {
        flowSensor,
        pressureSensor,
        levelSensor,
        conductivitySensor
    }
}
