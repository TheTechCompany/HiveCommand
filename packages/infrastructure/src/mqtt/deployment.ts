import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { Config, Input, Output } from '@pulumi/pulumi';

export const RabbitMQDeployment = async (provider: Provider, appName: string, storageClaim: k8s.core.v1.PersistentVolumeClaim, authApi: Output<string>, ns: k8s.core.v1.Namespace) => {


    const config = new Config();
    const suffix = config.require('suffix');

    const appLabels = { appClass: appName };

    const configMap = new k8s.core.v1.ConfigMap(`${appName}-config`, {
        metadata: {
            namespace: ns.metadata.name,
        },
        data: {
            'rabbitmq.conf': authApi.apply(authApi => `log.console = true
log.console.level = debug

auth_backends.1 = rabbit_auth_backend_http

auth_http.user_path = ${authApi}/auth/user
auth_http.vhost_path = ${authApi}/auth/vhost
auth_http.resource_path = ${authApi}/auth/resource
auth_http.topic_path = ${authApi}/auth/topic`),
            'enabled_plugins': '[rabbitmq_prometheus,rabbitmq_auth_backend_http].'
        }
    }, {
        provider
    })

    const deployment = new k8s.apps.v1.Deployment(`${appName}-dep`, {
        metadata: { 
            labels: appLabels,
            namespace: ns.metadata.name
        },
        spec: {
            replicas: 1,
            strategy: { type: "RollingUpdate" },
            selector: { matchLabels: appLabels },
            template: {
                metadata: { labels: appLabels },
                spec: {
                 
                    hostname: `hivecommand-mqtt-${suffix}`,
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `rabbitmq:3.9`,
                        ports: [{ name: "amqp", containerPort: 5672 }],
                        volumeMounts: [
                            {
                                name: 'persistence',
                                mountPath: `/var/lib/rabbitmq/mnesia/`
                            },
                            {
                                name: 'config',
                                mountPath: '/etc/rabbitmq'
                            }
                        ],
                        // env: [
                        //     {name: 'POSTGRES_PASSWORD', value: process.env.TIMESERIES_PASSWORD},
                        // ],
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
                        },
                        {
                            name: 'config',
                            configMap: {
                                name: configMap.metadata.name
                            }
                        }
                    ]
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