import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { ExportLambda } from "./src/export-lambda";
import { CompileReportLambda } from './src/compile-report';
import { Config } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes';

const main = (async () => {

    const config = new Config();
    const org = config.require('org');

    const suffix = config.require('suffix');

    const dbRef = new pulumi.StackReference(`${org}/hexhive-db/db-${suffix}`)
    const stackRef = new pulumi.StackReference(`${org}/base-infrastructure/prod`)
    
    const kubeconfig = stackRef.getOutput('k3sconfig');

    const dbUrl = dbRef.getOutput('timescale_url');
    const dbPass = dbRef.getOutput('postgres_pass');
    
    const provider = new Provider('eks', { 
        kubeconfig
    });

    const exportFn = await ExportLambda();

    const namespace = new k8s.core.v1.Namespace(`hivecommand-reportbot-${suffix}`, {
        metadata: {
            name: `hivecommand-reportbot-${suffix}`
        }
    }, {
        provider
    })

    const appName = `hive-command-reportbot-${suffix}`
    const appLabels = { appClass: appName };


    const {deployment: compileReportJob, bucket, key} = await CompileReportLambda(provider, namespace, appName, appLabels, dbUrl, dbPass);

    return {
        exportFunction: exportFn.name,
        key,
        bucket
    }
})();

export const exportFunction = main.then((res) => res.exportFunction)

export const reportBotSecret = main.then((res) => res.key.secret);
export const reportBotKey = main.then((res) => res.key.id);
export const reportBotBucket = main.then((res) => res.bucket);