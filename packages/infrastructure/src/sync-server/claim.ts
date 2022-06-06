import * as k8s from '@pulumi/kubernetes'
import { Config } from '@pulumi/pulumi'
import { Provider } from '@pulumi/kubernetes'

export const StorageClaim = (provider: Provider, namespace: k8s.core.v1.Namespace ) => {
    const config = new Config();

    const suffix = config.require('suffix');

    const pvc = new k8s.core.v1.PersistentVolumeClaim(`sync-server-${suffix}-claim`, {
        metadata: {
            name: `sync-server-claim-${suffix}`,
            namespace: namespace.metadata.name
        },
        spec: {
            accessModes: ['ReadWriteOnce'],
            storageClassName: 'gp2',
            resources: {
                requests: {
                    storage: '4Gi'
                }
            }
        },
        
    }, {
        provider
    })

    return pvc;
}