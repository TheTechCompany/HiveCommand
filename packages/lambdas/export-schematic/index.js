const {PutObjectCommand, GetObjectCommand, S3Client} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {export_schematic} = require('@hive-command/schematic-export')
const path = require('path');
const { nanoid } = require("nanoid");
const fs = require('fs');
const chromium = require('@sparticuz/chromium');

const client = new S3Client({region: 'ap-southeast-2'});

exports.handler = async function (event, context) {

    const { sourceKey, targetKey } = event;

    console.log({event})

    if(!sourceKey || !targetKey) throw new Error("No sourceKey or no targetKey");

    const getCmd = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME || "test-bucket",
        Key: sourceKey
    })

    const sourceSchematic = await client.send(getCmd)

    const schematicString = await sourceSchematic.Body?.transformToString('utf-8');

    const sourceProgram = JSON.parse(schematicString);

    const pdfPath = path.join(__dirname, 'output.pdf');
    console.log("Exporting Schematic...")

    const data = await export_schematic(sourceProgram || {
        name: "Default Project",
        pages: [
            {id: '1', nodes: [{id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} }]},
            {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
        ]
    }, 297/210, {
        args: chromium.args.filter((a) => a.indexOf('--window-size') < 0),
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
        executablePath: await chromium.executablePath
    })

    console.log("Exported Schematic!")

    const putCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME || "test-bucket",
        Key: targetKey,
        Body: data
    });

    const response = await client.send(putCommand);

    console.log("Posted Schematic!")

    // const getCommand = new GetObjectCommand({Bucket: process.env.BUCKET_NAME || 'test-bucket', Key: targetKey});

    // console.log("Presigned Schematic!")

    return targetKey; //getSignedUrl(client, getCommand, {expiresIn: 3600});
};
