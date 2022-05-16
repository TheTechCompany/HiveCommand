import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const TimeseriesDeployment = async (provider: Provider, appName: string, storageClaim: k8s.core.v1.PersistentVolumeClaim,  namespace: k8s.core.v1.Namespace) => {

    const appLabels = { appClass: appName };

    const deployment = new k8s.apps.v1.Deployment(`${appName}-dep`, {
        metadata: { 
            labels: appLabels,
            namespace: namespace.metadata.name
         },
        spec: {
            replicas: 1,
            strategy: { type: "RollingUpdate" },
            selector: { matchLabels: appLabels },
            template: {
                metadata: { labels: appLabels },
                spec: {
                    nodeSelector: {
                        'eks.amazonaws.com/nodegroup': 'managed-nodes'
                    },
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `timescale/timescaledb:latest-pg12`,
                        ports: [{ name: "postgres", containerPort: 5432 }],
                        volumeMounts: [
                            {
                                name: 'persistence',
                                mountPath: `/var/lib/postgresql/data`
                            }
                        ],
                        env: [
                            {name: 'POSTGRES_PASSWORD', value: process.env.TIMESERIES_PASSWORD},
                        ],
                        resources: {
                            limits: {
                                cpu: '0.25'
                            }
                        }
                    }],
                    volumes: [
                        {
                            name: 'persistence',
                            persistentVolumeClaim: {
                                claimName: storageClaim.metadata.name
                            }
                        }
                    ]
                }
            }
        },
    }, { provider: provider });

    return deployment
}