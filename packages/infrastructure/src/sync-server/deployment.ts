import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = async (provider: Provider, appName: string, timeseriesHost: Output<any>, rabbitHost: Output<any>) => {

    const config = new Config()
    
    const suffix = config.require('suffix');
    const imageTag = process.env.IMAGE_TAG 

    // const syncHostname = config.require('sync-host');

    const namespace = new k8s.core.v1.Namespace(`hivecommand-sync-${suffix}`, {
        metadata: {
            name: `hivecommand-sync-${suffix}`
        }
    }, {
        provider
    })

    const appLabels = { appClass: appName };

    const ovpnKey = new k8s.core.v1.Secret(`sync-server-ovpn-${suffix}`, {
        metadata: {
            name: `sync-server-ovpn-${suffix}`,
            namespace: namespace.metadata.name
        },
        stringData: {
            'openvpn.conf': process.env[`${suffix.toUpperCase()}_SYNC_OVPN`] || ''
        }
    }, {
        provider
    })

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
                    dnsConfig: {
                        nameservers: ['192.168.200.1']
                    },
                    // hostname: syncHostname,
                    // hostname: 'staging_discovery.hexhive.io',
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `thetechcompany/hive-command-sync:${imageTag}`,
                        // ports: [{ name: "postgres", containerPort: 5432 }],
                        
                        volumeMounts: [
                            {
                                name: 'ovpn',
                                mountPath: `/etc/openvpn`,
                            }
                        ],
                        env: [
                            {name: 'HEXHIVE_API_URL', value: process.env.HEXHIVE_API_URL},
                            {name: 'HEXHIVE_API_KEY', value: process.env.HEXHIVE_API_KEY},
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
                        },
                        securityContext: {
                            privileged: true,
                            capabilities: {
                                add: ["NET_ADMIN"]
                            }
                        }
                    }],
                    volumes: [
                        {
                            name: 'ovpn',
                            secret: {
                                secretName: ovpnKey.metadata.name,
                                
                            }
                        }
                    ]
                }
            }
        },
    }, { provider: provider });

    return deployment
}