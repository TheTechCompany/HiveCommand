import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Input, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = (provider: Provider, namespace: k8s.core.v1.Namespace, appName: any, appLabels: any, dbUrl: Output<any>, dbPass: Output<any>, rabbitHost: Output<any>, iotEndpoint: Output<any>) => {

    const config = new Config();

    const suffix = config.require('suffix');
    const imageTag = process.env.IMAGE_TAG 


    const deployment = new k8s.apps.v1.Deployment(`${appName}-dep`, {
        metadata: { labels: appLabels, namespace: namespace.metadata.name },
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
                        image: `thetechcompany/hive-command-gds:${imageTag}`,
                        ports: [{ name: "http", containerPort: 8004 }],
                        volumeMounts: [
                        ],
                        env: [
                            // { name: 'CLIENT_ID', value: process.env.CLIENT_ID || 'test'},
                            // { name: 'CLIENT_SECRET', value: process.env.CLIENT_SECRET || 'secret' },
                            { name: 'NODE_ENV', value: 'production' },
                            // { name: 'ROOT_SERVER', value: `http://${rootServer}` },
                            { name: "IOT_ENDPOINT", value: iotEndpoint },
                            { name: "IOT_USER", value: process.env.IOT_USER },
                            { name: "IOT_PASS", value: process.env.IOT_PASS },
                            { name: "IOT_EXCHANGE", value: process.env.IOT_EXCHANGE || 'device_values' },
                            { name: "IOT_SECRET", value: process.env.IOT_SECRET },
                            { name: "RABBIT_URL",  value: rabbitHost.apply(url => `amqp://${url}`) },
                            { name: "VERSION_SHIM", value: '1.0.10'},
                            // { name: 'REDIS_URL', value: redisUrl.apply(url => url)},
                            // { name: 'MONGO_URL', value: mongoUrl.apply((url) => `mongodb://${url}/hivecommand`)},
                            { name: 'JWT_SECRET', value: process.env.JWT_SECRET},
                            { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}/hivecommand?connect_timeout=100`) },

                            // { name: 'UI_URL',  value: `https://${domainName}/dashboard` },
                            // { name: 'BASE_URL',  value: `https://${domainName}`},
                            // { name: "NEO4J_URI", value: process.env.NEO4J_URI /*neo4Url.apply((url) => `neo4j://${url}.default.svc.cluster.local`)*/ },
                            // { name: "MONGO_URL", value: mongoUrl.apply((url) => `mongodb://${url}.default.svc.cluster.local`) },
                        ],
                        readinessProbe: {
                            httpGet: {
                                path: '/',
                                port: 'http'
                            }
                        },
                        
                        // livenessProbe: {
                        //     httpGet: {
                        //         path: '/graphql',
                        //         port: 'http'
                        //     }
                        // }
                    }],
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