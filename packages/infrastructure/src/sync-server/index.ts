import { Provider } from '@pulumi/kubernetes'
import { Config, Output } from '@pulumi/pulumi'
import { Deployment } from './deployment'

export default async (provider: Provider, timeseriesHost: Output<any>) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-sync-${suffix}`

    // const deployment = await Deployment(provider, appName, timeseriesHost)

    return {
        // deployment
    }
}