const {PutObjectCommand, S3Client} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {export_schematic} = require('@hive-command/schematic-export')
const path = require('path');
const nanoid = require("nanoid");
const fs = require('fs');

const client = new S3Client({region: 'ap-southeast-2'});

exports.handler = async function (event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));

    const pdfPath = path.join(__dirname, 'output.pdf');

    await export_schematic(event.program || {
        pages: [
            {id: '1', nodes: [{id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} }]},
            {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
        ]
    }, pdfPath)

    const id = nanoid();

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME || "test-bucket",
        Key: id,
        Body: fs.readFileSync(pdfPath)
    });
    
    const response = await client.send(command);

    // await s3.upload({
    //     Bucket: process.env.BUCKET_NAME,
    //     Key: id,
    //     Body: fs.readFileSync(pdfPath)
    // }).promise();

    return getSignedUrl(client, command, {expiresIn: 3600});
    // return context.logStreamName;
};
