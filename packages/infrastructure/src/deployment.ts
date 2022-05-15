import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = (provider: Provider, rootServer: string, dbUrl: Output<any>, dbPass: Output<any>, timeseriesHost: Output<any>, rabbitHost: Output<any>) => {

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
                            { name: 'NODE_ENV', value: 'production' },
                            { name: 'ROOT_SERVER', value: `http://${rootServer}` },
                            {name: "RABBIT_URL",  value: rabbitHost.apply(url => `amqp://${url}.default.svc.cluster.local`)},
                            {name: "VERSION_SHIM", value: '1.0.10'},
                            {name: "TIMESERIES_HOST", value:  timeseriesHost.apply(url => `${url}.default.svc.cluster.local`)},
                            {name: "TIMESERIES_PASSWORD",  value: process.env.TIMESERIES_PASSWORD},
                            {name: "MONGO_URL", value: process.env.COMMAND_MONGO_URL},
                            {name: "MONGO_DB", value: process.env.COMMAND_MONGO_DB},
                            {name: "MONGO_USER", value: process.env.COMMAND_MONGO_USER},
                            {name: "MONGO_PASS", value: process.env.COMMAND_MONGO_PASS},
                            {name: "MONGO_AUTH_DB", value: process.env.COMMAND_MONGO_AUTH_DB},

                            { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}.default.svc.cluster.local:5432/hivecommand`) },

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