import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { all, Config, Input, Output } from '@pulumi/pulumi';

export const RabbitMQDeployment = async (provider: Provider, appName: string, dbUrl: any, dbPass: any, ns: k8s.core.v1.Namespace) => {


    const config = new Config();
    const suffix = config.require('suffix');

    const appLabels = { appClass: appName };

    const imageTag = process.env.IMAGE_TAG;

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
                    containers: [{
                        imagePullPolicy: "Always",
                        name: appName,
                        image:  `thetechcompany/mqtt-auth:${imageTag}`,
                        ports: [{name: "internal", containerPort: 8005}],
                        env: [
                            { name: "DATABASE_URL", value: all([dbUrl, dbPass]).apply(([url, pass]) => `postgresql://postgres:${pass}@${url}/hivecommand?connect_timeout=100`) },
                            { name: "IOT_USER", value: process.env.IOT_USER },
                            { name: "IOT_PASS", value: process.env.IOT_PASS },
                            { name: "IOT_EXCHANGE", value: process.env.IOT_EXCHANGE || 'device_values' },
                            { name: "IOT_SECRET", value: process.env.IOT_SECRET },
                        ],
                        resources: {
                            limits: {
                                cpu: '0.25'
                            }
                        }
                    }],
                   
                }
            }
        },
    }, { provider: provider });

    return deployment
}