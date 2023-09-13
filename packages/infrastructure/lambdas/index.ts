import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { ExportLambda } from "./src/export-lambda";

const main = (async () => {
    const exportFn = await ExportLambda();

    return {
        exportFunction: exportFn.name
    }
})();

export const exportFunction = main.then((res) => res.exportFunction)
