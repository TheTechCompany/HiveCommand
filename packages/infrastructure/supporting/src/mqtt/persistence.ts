import * as k8s from '@pulumi/kubernetes'
import { Config, Output } from '@pulumi/pulumi';
import * as aws from '@pulumi/aws'
import {Provider} from '@pulumi/kubernetes'

export const RabbitMQPersistence = async (provider: Provider, vpcId: Output<any>, ns: k8s.core.v1.Namespace) => {
    const config = new Config()

    const suffix = config.get('suffix');

    let efsRoot = `hivecommand-mqtt-storage-${suffix}`;

    const targets = [];

    const storageClaim = new k8s.core.v1.PersistentVolumeClaim(`${efsRoot}-pvc`, {
        metadata: {
            name: `${efsRoot}-pvc`,
            namespace: ns.metadata.name
        },
        spec: {
            accessModes: ['ReadWriteOnce'],
            storageClassName: 'ebs',
            // volumeName: storagePv.metadata.name,
            resources: {
                requests: {
                    storage: '20Gi'
                }
            }
        }   
    }, {provider})
    
    return {
        storageClaim,
        // storagePv
    }
}