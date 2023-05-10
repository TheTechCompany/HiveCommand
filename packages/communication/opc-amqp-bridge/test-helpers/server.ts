import { DataType, OPCUAServer, StatusCodes, Variant } from "node-opcua";

let on = false;
let speed = 0;

const addPump = (namespace: any, server: any, ix: number) => {
    const pump = namespace?.addObject({
        browseName: `PMP10${ix+ 1}`,
        organizedBy: server.engine.addressSpace?.rootFolder.objects
    })

    namespace?.addVariable({
        browseName: "On",
        organizedBy: pump,
        dataType: DataType.Boolean,
        minimumSamplingInterval: 500,
        value: {
            get: () => {
                return new Variant({dataType: DataType.Boolean, value: on})
            }, 
            set: (value: Variant) => {
                on = value.value;
                console.log("PMP101 ON", {value})
                return StatusCodes.Good;
            }
        }
    })
    

    namespace?.addVariable({
        browseName: "Speed",
        organizedBy: pump,
        dataType: DataType.Float,
        minimumSamplingInterval: 500,
        value: {
            get: () => {
                return new Variant({dataType: DataType.Float, value: speed})
            }, 
            set: (value: Variant) => {
                speed = value.value;
                console.log("PMP101 ON", {value})
                return StatusCodes.Good;
            }
        }
    })
}

export const OPCServer = async () => {
    let server = new OPCUAServer({
        port: 4840
    })    

    await server.initialize()

    await server.start()

    const namespace = server.engine.addressSpace?.getOwnNamespace();

   


    setInterval(() => {
        on = !on;
    }, 1000);

    setInterval(() => {
        speed ++;
    }, 500)

  
    for(var i = 0; i < 8; i++){
        addPump(namespace, server, i)
    }

    return server
}