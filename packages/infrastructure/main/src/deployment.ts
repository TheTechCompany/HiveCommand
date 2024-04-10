import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = (provider: Provider, rootServer: string, dbUrl: Output<any>, dbPass: Output<any>, rabbitHost: Output<any>, mongoUrl: Output<any>, redisUrl: Output<any>, mqttURL: string, lambdaFunction: string, reportBucket: string) => {

    const config = new Config();

    const suffix = config.require('suffix');
    const imageTag = process.env.IMAGE_TAG 

    const appName = `hive-command-${suffix}`

    const appLabels = { appClass: appName };

    const deployment = new k8s.apps.v1.Deployment(`${appName}-dep`, {
        metadata: { labels: appLabels },
        spec: {
            replicas: 1,
            strategy: { type: "RollingUpdate" },
            selector: { matchLabels: appLabels },
            template: {
                metadata: { labels: appLabels },
                spec: {
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `thetechcompany/hivecommand-backend:${imageTag}`,
                        ports: [{ name: "http", containerPort: 9010 }],
                        volumeMounts: [
                        ],
                        env: [
                            // { name: 'CLIENT_ID', value: process.env.CLIENT_ID || 'test'},
                            // { name: 'CLIENT_SECRET', value: process.env.CLIENT_SECRET || 'secret' },
                            { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
                            { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
                            { name: 'EXPORT_LAMBDA', value: lambdaFunction },
                            { name: 'NODE_ENV', value: 'production' },
                            { name: 'ROOT_SERVER', value: `http://${rootServer}` },
                            { name: "RABBIT_URL",  value: rabbitHost.apply(url => `amqp://${url}`) },
                            { name: 'DEVICE_MQ_HOST', value: mqttURL },
                            { name: 'DEVICE_MQ_USER', value: process.env.IOT_USER },
                            { name: 'DEVICE_MQ_PASS', value: process.env.IOT_PASS },
                            { name: "VERSION_SHIM", value: '1.0.10' },
                            { name: 'REDIS_URL', value: redisUrl.apply(url => url) },
                            { name: 'MONGO_URL', value: mongoUrl.apply((url) => `mongodb://${url}/hivecommand`) },

                            { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}/hivecommand?connect_timeout=100`) },
                            { name: 'REPORT_BUCKET', value: reportBucket }
                            // { name: 'UI_URL',  value: `https://${domainName}/dashboard` },
                            // { name: 'BASE_URL',  value: `https://${domainName}`},
                            // { name: "NEO4J_URI", value: process.env.NEO4J_URI /*neo4Url.apply((url) => `neo4j://${url}.default.svc.cluster.local`)*/ },
                            // { name: "MONGO_URL", value: mongoUrl.apply((url) => `mongodb://${url}.default.svc.cluster.local`) },
                        ],
                        readinessProbe: {
                            httpGet: {
                                path: '/graphql',
                                port: 'http'
                            }
                        },

                        resources: {
                            requests: {
                                cpu: '0.5',
                                memory: '0.5Gi'
                            },
                            limits: {
                                cpu: '1',
                                memory: '1Gi'
                            }
                        }
                        // livenessProbe: {
                        //     httpGet: {
                        //         path: '/graphql',
                        //         port: 'http'
                        //     }
                        // }
                    }],
                    nodeSelector: {
                        role: 'worker'
                    }
                    // volumes: [{
                    //     name: `endpoints-config`,
                    //     configMap: {
                    //         name: configMap.metadata.name,
                    //         items: [{
                    //             key: 'endpoints',
                    //             path: 'endpoints.json'
                    //         }]
                    //     }
                    // }]
                }
            }
        },
    }, { provider: provider });

    return deployment
}