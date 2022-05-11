import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = async (provider: Provider, appName: string, timeseriesHost: Output<any>) => {

    const config = new Config()
    
    const suffix = config.require('suffix');

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
                    hostname: syncHostname,
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `thetechcompany/hive-command-sync:${suffix}`,
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