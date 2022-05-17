import * as k8s from '@pulumi/kubernetes'
import { Config, Output } from '@pulumi/pulumi';
import * as aws from '@pulumi/aws'
import {Provider} from '@pulumi/kubernetes'
// import { RabbitMQPersistence } from './rabbitmq/persistence';
// import { TimeseriesPersistence } from './timeseries/persistence';

export const Persistence = async (provider: Provider, vpcId: Output<any>) => {
    // const { storageClaim: rabbitPersistence } = await RabbitMQPersistence(provider, vpcId)
    // const { storageClaim: timeseriesPersistence } = await TimeseriesPersistence(provider, vpcId)

    // return {
    //     rabbitPersistence,
    //     timeseriesPersistence
    // }
}