import { DataType, Namespace, StatusCodes, UAObjectType, UAVariable, Variant } from "node-opcua"
import { NamespaceBody } from "typescript"


const actuator = (namespace: Namespace) => {
    let actuator = namespace.addObjectType({
        browseName: "GenericActuator",
    })

    namespace.addVariable({
        browseName: "Input",
        dataType: DataType.Boolean,
        componentOf: actuator,
        minimumSamplingInterval: 0,
        value: {
            get: function(this: UAVariable){
                let rand = Math.random();

                console.log(this.parent?.browseName.toString())
                return /* get value from store */ new Variant({dataType: DataType.Double, value: rand})
            },
            set: (value: Variant) : StatusCodes => {
                console.log("Set value", value)
                return StatusCodes.Good
            } 
        },
        modellingRule: "Mandatory"
    })

    namespace.addVariable({
        browseName: "Status",
        dataType: DataType.String,
        componentOf: actuator,
        modellingRule: "Mandatory"
    })

    actuator.install_extra_properties()

    return actuator
}

const singleActionActuator = (namespace: Namespace, parent: UAObjectType) => {
    let singleAction = namespace.addObjectType({
        browseName: "SingleActionActuator",
        subtypeOf: parent
    })
}

const blowerType = (namespace: Namespace, parentType: UAObjectType) => {
    let blower = namespace.addObjectType({
        browseName: "Blower",
        subtypeOf: parentType
    })
    return blower;
}

const valveType = (namespace: Namespace, parentType: UAObjectType) => {
    let valve = namespace.addObjectType({
        browseName: "Valve",
      //  subtypeOf: parentType
    })

    namespace.addVariable({
        componentOf: valve,
        browseName: "Input",
        dataType: DataType.Double,
        modellingRule: "Mandatory",
        minimumSamplingInterval: 0
    })

    return valve;
}

const pumpType = (namespace: Namespace) => {
    let pump = namespace.addObjectType({
        browseName: "Pump"
    })
    return pump;
}

const dosingPumpType = (namespace: Namespace, parentType: UAObjectType) => {
    let dosingPump = namespace.addObjectType({
        browseName: "Dosing Pump",
        subtypeOf: parentType
    })

    return dosingPump
}

const vsdPumpType = (namespace: Namespace, parentType: UAObjectType) => {
    let vsdPump = namespace.addObjectType({
        browseName: "VSD",
        subtypeOf: parentType
    })
    return vsdPump
}

export default (namespace: Namespace) => {
    const actuatorType = actuator(namespace)

    const valve = valveType(namespace, actuatorType)
    const blower = blowerType(namespace, actuatorType)
    const pump = pumpType(namespace)

    const dosingPump = dosingPumpType(namespace, pump)
    const vsdPump = vsdPumpType(namespace, pump)

    return {
        valve,
        blower,
        pump,
        vsd: vsdPump,
        dosingPump: dosingPump
    }
}