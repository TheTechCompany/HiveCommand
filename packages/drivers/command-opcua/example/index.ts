import OPCUAClient from '@hive-command/opcua-client'

(async () => {

    const client = new OPCUAClient();

    await client.connect(`opc.tcp://192.168.0.10:4840`)

    console.log("Conenctec!")
    
    const dv = await client.getDetails(`/Objects/0:Server/4:AC500 PM56xx-2ETH/3:Resources/4:Application/3:GlobalVars/4:GVL/4:AV201/4:Eng`)

    console.log(dv);
})();