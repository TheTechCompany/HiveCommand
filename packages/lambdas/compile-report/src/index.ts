import { Prisma, PrismaClient } from "@hive-command/data";
import moment from "moment";
import { compileReport } from "./compile";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from 'fs';
import { nanoid } from "nanoid";

const client = new S3Client({});

const prisma = new PrismaClient();

(async () => {
    //Get all reports that need compiling
    console.time('Compiling Reports');

    const uncompiled_reports = await prisma.$queryRaw<{id: string, lastInstance?: Date, reportsNeeded?: number}[]>`
 		SELECT
            totals.id,
            "lastInstance",
            totals.reports - totals.instances as "reportsNeeded"
        FROM 
        (SELECT 
            "DeviceReport".id,
            FLOOR((1000*EXTRACT(EPOCH FROM now() - "DeviceReport"."startDate")) / (1000 * EXTRACT(EPOCH FROM "reportLength"::interval))) as reports,
            COUNT("DeviceReportInstance"."id") as instances,
            max("DeviceReportInstance"."endDate") as "lastInstance"
        FROM "DeviceReport" 
        LEFT JOIN "DeviceReportInstance" 
        ON "DeviceReportInstance"."reportId" = "DeviceReport"."id"
        WHERE "DeviceReport"."recurring" = TRUE
        GROUP BY "DeviceReport"."id") as totals
        WHERE totals.instances < totals.reports
    `

    if(uncompiled_reports?.length <= 0){
        console.log("No reports found that need compiling exiting succesfully now!");
        console.timeEnd('Compiling Reports');
        return true;
    }

    const reports = await prisma.deviceReport.findMany({
        where: {
            id: {in: uncompiled_reports?.map((x) => x.id)}
        },
        include: {
            fields: {
                include: {
                    device: true,
                    key: true
                }
            }
        }
    })

    for(var i = 0; i < reports.length; i++){
        let report = reports[i];
        let { lastInstance, reportsNeeded = 0} = uncompiled_reports?.find((a) => a.id == report.id) || {};
        if(!lastInstance) lastInstance = report.startDate;

        console.time(`Creating ${reportsNeeded} reports for ${report.deviceId} ${report.id}`)
        for(var r = 0; r < reportsNeeded; r++){
            const duration = moment.duration(...(report?.reportLength?.split(' ') || []));

            let startDate = moment(new Date(lastInstance)).add(r * duration.as('seconds'), 'seconds').toDate();
            let endDate = moment(new Date(lastInstance)).add((r + 1) * duration.as('seconds'), 'seconds').toDate();
            
            console.log("Compiling report for ", report.deviceId, report.id, " ", startDate, endDate);

            if(report.deviceId){
                
                const id = nanoid();

                await prisma.deviceReportInstance.create({
                    data: {
                        id: id,
                        done: false,
                        startDate,
                        endDate,
                        version: report.version,
                        fileId: `${id}.xlsx`,
                        reportId: report.id
                    }
                })

                const {path} = await compileReport(prisma, id, report.deviceId, report, startDate, endDate) || {}

                if(path){
                    const command = new PutObjectCommand({
                        Bucket: process.env.BUCKET || "test-bucket",
                        Key: `${id}.xlsx`,
                        Body: readFileSync(path),
                    });

                    try{
                        await client.send(command);
                    }catch(err){
                        console.error("Error making S3 request", err);

                        // await prisma.deviceReportInstance.delete({where: {id}})
                        // continue;
                    }

                    await prisma.deviceReportInstance.update({
                        where: {id},
                        data: {
                            done: true
                        }
                    })
                }else{
                    await prisma.deviceReportInstance.delete({where: {id}})
                }
            }
           
        }
        console.timeEnd(`Creating ${reportsNeeded} reports for ${report.deviceId} ${report.id}`)

    }
   
    console.timeEnd('Compiling Reports');

})();