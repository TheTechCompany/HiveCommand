import  OPCUAClient  from "../src";
import { DataType } from "node-opcua";

let types = [
    {key: 'Valve', items: [
        {key: 'Eng'},
        {key: 'Den'},
        {key: 'Auto'},
        {key: 'Manual'},
        {key: 'Fault'},
        {key: 'HMI_Auto'},
        {key: 'HMI_Manual'}
    ]},
    {key: 'FlowMeter', items: [
        {key: 'Flow'},
        {key: 'Fault'}
    ]},
    {key: 'PressureSensor', items: [
        {key: 'Pressure'},
        {key: 'Temperature'}
    ]}
];

let tags = [
    {key: 'AV101', type: 'Valve'},
    {key: 'AV102', type: 'Valve'},
    {key: 'AV103', type: 'Valve'},
    {key: 'AV201', type: 'Valve'},
    {key: 'AV202', type: 'Valve'},
    {key: 'AV203', type: 'Valve'},
    {key: 'AV204', type: 'Valve'},
    {key: 'AV205', type: 'Valve'},
    {key: 'AV301', type: 'Valve'},
    {key: 'AV302', type: 'Valve'},
    {key: 'AV401', type: 'Valve'},
    {key: 'AV402', type: 'Valve'},
    {key: 'AV403', type: 'Valve'},

    {key: 'FT101', type: 'FlowMeter'},
    {key: 'FT201', type: 'FlowMeter'},
    {key: 'FT301', type: 'FlowMeter'},

    {key: 'PT201', type: 'PressureSensor'},
    {key: 'PT301', type: 'PressureSensor'},
    {key: 'PT401', type: 'PressureSensor'},
];

(async () => {
    
    const client = new OPCUAClient()

//    console.log({client: JSON.stringify({client})})

    await client.connect(`opc.tcp://192.168.10.10:4840`);

    console.log("Conencted");

    let subTags = tags.map((t) => {
        let type = types.find((a) => a.key == t.type);

        return (type?.items || []).map((item) => ({tag: `${t.key}.${item.key}`, path: `/Objects/0:Server/4:AC500 PM56xx-2ETH/3:Resources/4:Application/3:GlobalVars/4:GVL/4:${t.key}/4:${item.key}`}))
    }).reduce((prev, curr) => prev?.concat(curr || []))

    console.log("Subscribing ", subTags.length)
    const {monitors, unsubscribe, unwrap} = await client.subscribeMulti(subTags, 500)

    console.log(subTags.length);

    monitors?.on('changed', (monitored, dv, index) => {
        console.log(monitored, dv)
    });

    // const res = await client.getDetails(`/Objects/1:Controller/1:Machine/1:Mode`)
    // console.log({res})

    // await client.setDetails(`/Objects/0:Server/1:Machine/1:Mode`, DataType.String, 'Manual')
    
    // console.log("Connected")
})();