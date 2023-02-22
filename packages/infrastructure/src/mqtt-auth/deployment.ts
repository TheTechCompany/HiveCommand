import {Provider} from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { Config, Input, Output } from '@pulumi/pulumi';

export const RabbitMQDeployment = async (provider: Provider, appName: string, ns: k8s.core.v1.Namespace) => {


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