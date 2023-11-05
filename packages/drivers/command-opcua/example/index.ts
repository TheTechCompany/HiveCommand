import OPCUAClient from '@hive-command/opcua-client'

(async () => {

    const client = new OPCUAClient();

    await client.connect(`opc.tcp://192.168.0.10:4840`)

    console.log("Conenctec!")
    
    const dv = await client.getDetails(`/Objects/Server/AC500 PM56xx-2ETH/Resources/Application/GlobalVars/GVL/AV201/Eng`)

    console.log(dv);
})();