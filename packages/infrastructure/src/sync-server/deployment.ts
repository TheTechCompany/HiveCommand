import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = async (provider: Provider, appName: string, timeseriesHost: Output<any>, rabbitHost: Output<any>) => {

    const config = new Config()
    
    const suffix = config.require('suffix');
    const imageTag = process.env.IMAGE_TAG 

    const syncHostname = config.require('sync-host');

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
                    // hostname: syncHostname,
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `thetechcompany/hive-command-sync:${imageTag}`,
                        // ports: [{ name: "postgres", containerPort: 5432 }],
                        // volumeMounts: [
                        //     {
                        //         name: 'persistence',
                        //         mountPath: `/var/lib/postgresql/data`
                        //     }
                        // ],
                        env: [
                            { name: 'TIMESERIES_HOST', value: timeseriesHost.apply(url => `${url}.default.svc.cluster.local`) },
                            { name: 'TIMESERIES_PASSWORD', value: process.env.TIMESERIES_PASSWORD },
                            { name: 'RABBIT_URL', value: rabbitHost.apply(url => `amqp://${url}.default.svc.cluster.local`)},
                            {name: "MONGO_URL", value: process.env.COMMAND_MONGO_URL},
                            {name: "MONGO_DB", value: process.env.COMMAND_MONGO_DB},
                            {name: "MONGO_USER", value: process.env.COMMAND_MONGO_USER},
                            {name: "MONGO_PASS", value: process.env.COMMAND_MONGO_PASS},
                            {name: "MONGO_AUTH_DB", value: process.env.COMMAND_MONGO_AUTH_DB},
                        ],
                        resources: {
                            limits: {
                                cpu: '0.25'
                            }
                        }
                    }],
                    // volumes: [
                    //     {
                    //         name: 'persistence',
                    //         persistentVolumeClaim: {
                    //             claimName: storageClaim.metadata.name
                    //         }
                    //     }
                    // ]
                }
            }
        },
    }, { provider: provider });

    return deployment
}