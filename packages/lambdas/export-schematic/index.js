const {PutObjectCommand, GetObjectCommand, S3Client} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {export_schematic} = require('@hive-command/schematic-export')
const path = require('path');
const { nanoid } = require("nanoid");
const fs = require('fs');
const chromium = require('@sparticuz/chromium');

const client = new S3Client({region: 'ap-southeast-2'});

exports.handler = async function (event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));

    const pdfPath = path.join(__dirname, 'output.pdf');
    console.log("Exporting Schematic...")


    const data = await export_schematic(event.program || {
        name: "Default Project",
        pages: [
            {id: '1', nodes: [{id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} }]},
            {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
        ]
    }, {
        args: chromium.args,
        // args: ['--no-sandbox']
        // args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
        executablePath: await chromium.executablePath
    })

    console.log("Exported Schematic!")

    const id = nanoid();

    const putCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME || "test-bucket",
        Key: id,
        Body: data
    });
    

    const response = await client.send(putCommand);

    console.log("Posted Schematic!")

    const getCommand = new GetObjectCommand({Bucket: process.env.BUCKET_NAME || 'test-bucket', Key: id});
    
    console.log("Presigned Schematic!")

    return getSignedUrl(client, getCommand, {expiresIn: 3600});
};
