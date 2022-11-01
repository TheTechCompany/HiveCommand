import * as k8s from '@pulumi/kubernetes'
import { Config } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes'
import * as aws from '@pulumi/aws'

export const Service = (provider: Provider, namespace: k8s.core.v1.Namespace, appName: any, appLabels: any, discoveryUrl: string, zoneId: string) => {

    const sslCert = new aws.acm.Certificate(`${discoveryUrl}-ssl-certif`, {
        domainName: discoveryUrl,
        // subjectAlternativeNames: [discoveryUrl],
        validationMethod: "DNS"
    }, {
        deleteBeforeReplace: false
    });

    let certValidations = sslCert.domainValidationOptions.apply((domains) => {
        return domains.map((domain) => {
            return new aws.route53.Record(`${domain.domainName}-certValidation-${domain.domainName}`, {
                name: domain.resourceRecordName,
                zoneId: zoneId,
                type: domain.resourceRecordType,
                records: [domain.resourceRecordValue],
                ttl: 60
            })
        })
    });

    const service = new k8s.core.v1.Service(`${appName}-svc`, {
        metadata: {
            name: `${appName}-svc`,
            labels: appLabels,
            namespace: namespace.metadata.name,
            annotations: {
            //    'service.beta.kubernetes.io/aws-load-balancer-ssl-cert': sslValidation.certificateArn,
            //     'service.beta.kubernetes.io/aws-load-balancer-ssl-ports': 'https',
            //     'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': 'http',
            //     // 'service.beta.kubernetes.io/aws-load-balancer-type': 'external',
            //     'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb',
            //     'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': 'ip',
            //     'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
             }
        },
        spec: {
            type: "NodePort",
            ports: [{ name: "http", port: 80, targetPort: "http" }, { name: "https", port: 443, targetPort: 'http' }],
            selector: appLabels,
        },
    }, { provider: provider });

    const ingress = new k8s.networking.v1.Ingress('frontend-ingess', {
        metadata: {
            // namespace: ''
            namespace: namespace.metadata.name,
            annotations: {
                'alb.ingress.kubernetes.io/listen-ports': '[{"HTTPS":443}, {"HTTP":80}]',
                'alb.ingress.kubernetes.io/certificate-arn': sslCert.arn,
                'alb.ingress.kubernetes.io/scheme': 'internet-facing',
                'alb.ingress.kubernetes.io/group.name': 'hexhive-core',
                'alb.ingress.kubernetes.io/success-codes': '200-499'
                // 'alb.ingress.kubernetes.io/target-node-labels': 'cluster=hexhive-cluster'
                // 'alb.ingress.kubernetes.io/target-type': 'ip'
                // 'alb.ingress.kubernetes.io/subnets': subnets.ids.apply((x) => x.join(', '))
            },
            
        },
        spec: {
            ingressClassName: 'alb',
            rules: [
                {
                    host: discoveryUrl,
                    http: {
                        paths: [
                            {
                                path: '/*',
                                pathType: 'ImplementationSpecific',
                                backend: {
                                    service: {
                                        name: service.metadata.name,
                                        port: {
                                            name: 'http'
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }, {
        provider
    })


    // Export the URL for the load balanced service.
    const url = ingress.status.loadBalancer.ingress[0].hostname;

    // aws.elb.getLoadBalancer({ })

    // const s : string = await url.apply((f) => f.toString())
    // const elbZone = await aws.route53.getZone({name: })
    //'Z0191605UGITHVV6M61S'

    const devRecord = new aws.route53.Record(`${appName}-frontend-dns`, {
        zoneId: zoneId,
        name: discoveryUrl,
        type: 'A',
        aliases: [{
            name: url,
            zoneId: 'Z1GM3OXH4ZPM65',
            evaluateTargetHealth: true
        }]
    })

    return service;
}