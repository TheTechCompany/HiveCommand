import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Input, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'
import * as aws from "@pulumi/aws";

export const CompileReportLambda = (provider: Provider, namespace: k8s.core.v1.Namespace, appName: any, appLabels: any, dbUrl: Output<any>, dbPass: Output<any>) => {

    const config = new Config();

    const suffix = config.require('suffix');
    
    const imageTag = process.env.IMAGE_TAG;

    const reportBot = new aws.iam.User(`reportbot-s3`, {
        name: 'reportbot-s3'
    });

    const s3 = new aws.s3.Bucket('hivecommand-reportbot-bucket', {
        corsRules: [
            {
                allowedHeaders: ['*'],
                allowedMethods: ['HEAD', 'GET'],
                allowedOrigins: ['https://go.hexhive.io', 'http://localhost:8000']
            }
        ]
    })

    const assumeRole = aws.iam.getPolicyDocument({
        statements: [{
            effect: "Allow",
            principals: [{
                type: "Service",
                identifiers: ["lambda.amazonaws.com"],
            }],
            // roles
            actions: ["sts:AssumeRole"],
        }],
    });

    const s3Document = aws.iam.getPolicyDocumentOutput(s3.bucket.apply(bucketName => ({
        // Version: "2012-10-17",
            statements: [
                {
                    sid: "AllowS3",
                    effect: "Allow",
                    actions: [
                        "s3:PutObject",
                        "s3:GetObject"
                    ],
                    resources: [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        }))
    );

    const reportBotPolicy = new aws.iam.UserPolicy('reportbot_policy', {
        name: 's3-access',
        user: reportBot.name,
        policy: s3Document.apply(doc => doc.json)
    })

    const key = new aws.iam.AccessKey('reportbot_key', {
        user: reportBot.name
    })

    const deployment = new k8s.batch.v1.CronJob(`${appName}-cronjob`, {
        metadata: { 
            labels: appLabels,
            namespace: namespace.metadata.name 
        },
        spec: {
            schedule: '0 */1 * * *',
            jobTemplate: {
                spec: {
                    template: {
                        spec: {
                            containers: [{
                                name: appName,
                                image: `thetechcompany/hive-command-reportbot:${imageTag}`,
                                env: [
                                    { name: 'AWS_ACCESS_KEY_ID', value: key.id},
                                    { name: 'AWS_SECRET_ACCESS_KEY', value: key.secret},
                                    { name: 'AWS_REGION', value: 'ap-southeast-2'},
                                    { name: 'NODE_ENV', value: 'production' },
                                    { name: "VERSION_SHIM", value: '1.0.10'},
                                 
                                    { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}/hivecommand?connect_timeout=100`) },
                                    { name: "BUCKET", value: s3.bucket }
                                ],
                            }],
                            restartPolicy: 'OnFailure',
                            nodeSelector: {
                                role: 'worker'
                            }
                        }
                    },
                    
                }
            }
        },
    }, { provider: provider });

    return {deployment, key, bucket: s3.bucket}
}