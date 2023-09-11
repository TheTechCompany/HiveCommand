import { Function } from '@pulumi/aws/lambda'
import * as archive from "@pulumi/archive";
import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi'
import { zipDir } from './zipper';
import yazl from 'yazl';
import fs from 'fs';
import path = require('path');

export const ExportLambda = async () => {

    const assumeRole = aws.iam.getPolicyDocument({
        statements: [{
            effect: "Allow",
            principals: [{
                type: "Service",
                identifiers: ["lambda.amazonaws.com"],
            }],
            actions: ["sts:AssumeRole"],
        }],
    });

    const iamForLambda = new aws.iam.Role("iamForLambda", {assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json)});

    const zip = new yazl.ZipFile();

    const zipPath = path.join(__dirname, "./archive.zip");

    await zipDir(
        zip,
        path.join(__dirname, "/../../../../lambdas/export-schematic"),
        null
    );

    zip.end();
    zip.outputStream.pipe(fs.createWriteStream(zipPath));

    const fn = new Function(`hivecommand-export-schematic-fn`, {
        code: new pulumi.asset.FileArchive(zipPath),
        role: iamForLambda.arn,
        handler: "index.handler",
        runtime: "nodejs18.x"
    })

    return fn;
}