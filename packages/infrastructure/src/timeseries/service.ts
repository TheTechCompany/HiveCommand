import * as k8s from '@pulumi/kubernetes'
import { Config } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes'

export const TimeseriesService = async (provider: Provider, appName: string) => {

    const appLabels = { appClass: appName };

    const service = new k8s.core.v1.Service(`${appName}-svc`, {
        metadata: { 
            labels: appLabels,
            name: `${appName}-svc`,
            annotations: {
                // 'service.beta.kubernetes.io/aws-load-balancer-ssl-cert': sslCert.arn,
                // 'service.beta.kubernetes.io/aws-load-balancer-ssl-ports': 'https',
                // 'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': 'http',
                // 'service.beta.kubernetes.io/aws-load-balancer-type': 'internal',
                // 'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': 'ip',
                // 'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
            }
        },
        spec: {
            type: "ClusterIP",
            ports: [{ name: "postgres", port: 5432, targetPort: "postgres" }],
            selector: appLabels,
        },
    }, { provider: provider });

    return service;
}