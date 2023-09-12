import { Function } from '@pulumi/aws/lambda'
import * as archive from "@pulumi/archive";
import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi'
import { zipDir } from './zipper';
import yazl from 'yazl';
import fs from 'fs';
import path = require('path');

export const ExportLambda = async () => {

    const s3 = new aws.s3.Bucket('hivecommand-schematic-export-bucket', {
        
    })

    const assumeRole = aws.iam.getPolicyDocument({
        statements: [{
            effect: "Allow",
            principals: [{
                type: "Service",
                identifiers: ["lambda.amazonaws.com"],
            }],
            roles
            actions: ["sts:AssumeRole"],
        }, {
			// "Sid": "VisualEditor0",
			effect: "Allow",
			actions: [
				"s3:PutObject",
				"s3:GetObject"
			],
			resources: [`arn:aws:s3:::${s3.bucket}/*`]
		}],
    });

    const iamForLambda = new aws.iam.Role("iamForLambda", {assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json)});

    // const zip = new yazl.ZipFile();

    const zipPath = path.join(__dirname, "./archive.zip");

    // await zipDir(
    //     zip,
    //     path.join(__dirname, "/../../../../lambdas/export-schematic"),
    //     null
    // );

    // zip.end();
    // zip.outputStream.pipe(fs.createWriteStream(zipPath));

    const fn = new Function(`hivecommand-export-schematic-fn`, {
        code: new pulumi.asset.FileArchive(zipPath),
        role: iamForLambda.arn,
        timeout: 30,
        memorySize: 512,
        handler: "index.handler",
        runtime: "nodejs18.x",
        layers: ['arn:aws:lambda:ap-southeast-2:764866452798:layer:chrome-aws-lambda:33'],
        environment: {
            variables: {
                BUCKET_NAME: s3.bucket
            }
        }
    })

    return fn;
}