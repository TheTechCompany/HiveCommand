import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Output } from '@pulumi/pulumi'
import * as eks from '@pulumi/eks'

export const Deployment = (provider: Provider, appName: string, dbUrl: Output<any>, dbPass: Output<any>, rabbitHost: Output<any>, mongoUrl: Output<any>, claim: k8s.core.v1.PersistentVolumeClaim,  namespace: k8s.core.v1.Namespace) => {

    const config = new Config()
    
    const suffix = config.require('suffix');
    const imageTag = process.env.IMAGE_TAG 

    const syncHostname = config.require('sync-host');

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
                   containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image: `thetechcompany/hive-command-sync:${imageTag}`,                        
                        volumeMounts: [
                            {
                                name: 'ovpn',
                                mountPath: `/etc/openvpn`,
                            },
                            {
                                name: 'sync-config',
                                mountPath: '/root/.config/node-opcua-local-discovery-server-nodejs'
                            }
                        ],
                        env: [
                            {name: 'HEXHIVE_API_URL', value: process.env.HEXHIVE_API_URL},
                            {name: 'HEXHIVE_API_KEY', value: process.env.HEXHIVE_API_KEY},
                            { name: 'MONGO_URL', value: mongoUrl.apply((url) => `mongodb://${url}/hivecommand`) },
                            { name: 'SYNC_HOST', value: syncHostname },
                            { name: 'HOSTNAME', value: syncHostname },
                            { name: 'RABBIT_URL', value: rabbitHost.apply(url => `amqp://${url}`)},
                            { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}/hivecommand?connect_timeout=100`) },

                        ],
                        resources: {
                            requests: {
                                cpu: '0.25',
                                memory: '0.5Gi'
                            },
                            limits: {
                                cpu: '0.5',
                                memory: '1Gi'
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
                        },
                        {
                            name: 'sync-config',
                            persistentVolumeClaim: {
                                claimName: claim.metadata.name
                            }
                        }
                    ]
                }
            }
        },
    }, { provider: provider });

    return deployment
}