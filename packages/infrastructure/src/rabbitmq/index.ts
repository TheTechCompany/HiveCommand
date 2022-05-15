import { Config, Output } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import { RabbitMQDeployment } from "./deployment"
import { RabbitMQService } from "./service"

export default async (provider: Provider) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-mq-${suffix}`


    const deployment = await RabbitMQDeployment(provider, appName);

    const service = await RabbitMQService(provider, appName)

    return {
        deployment,
        service
    }
}