import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'

export const RabbitMQDeployment = async (provider: Provider, appName: string) => {

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
                        image: `rabbitmq:3.9`,
                        ports: [{ name: "amqp", containerPort: 5672 }],
                        // volumeMounts: [
                        //     {
                        //         name: 'persistence',
                        //         mountPath: `/var/lib/postgresql/data`
                        //     }
                        // ],
                        // env: [
                        //     {name: 'POSTGRES_PASSWORD', value: process.env.TIMESERIES_PASSWORD},
                        // ],
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