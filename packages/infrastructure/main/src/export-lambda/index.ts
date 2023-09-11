import { Function } from '@pulumi/aws/lambda'
import * as archive from "@pulumi/archive";
import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi'

export const ExportLambda = () => {

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

    
    const lambda = archive.getFile({
        type: "zip",
        sourceFile: path.join(__dirname, "lambda.js"),
        outputPath: "lambda_function_payload.zip",
    });

    const fn = new Function(`hivecommand-export-schematic-fn`, {
        code: new pulumi.asset.FileArchive("lambda_function_payload.zip"),
        role: iamForLambda.arn,
        handler: "index.test",
        runtime: "nodejs18.x"
    })

    return fn;
}