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

    let recurring_reports : any[] = await prisma.deviceReport.findMany({
        where: {
            startDate: {
                lte: new Date()
            },
            recurring: true,
            reportLength: {
                not: null
            }
        },
        include: {
            instances: {
                orderBy: {
                    endDate: 'asc'
                }
            }
        }
    })

    recurring_reports = recurring_reports.map((report) => {
        let lastDate = report.instances?.[report.instances.length - 1]?.endDate || report.startDate;

        return {
            ...report,
            lastDate,
        }
    }).filter((report) => {
        let lastDate = report.lastDate

        return moment.duration(moment.utc().diff(moment.utc(lastDate))) > moment.duration(...report.reportLength?.split(' ') as any)
    })

    // const uncompiled_reports = await prisma.$queryRaw<{ id: string, lastInstance?: Date, reportsNeeded?: number }[]>`
 	// 	SELECT
    //         totals.id,
    //         "lastInstance",
    //         totals.reports - totals.instances as "reportsNeeded"
    //     FROM 
    //     (SELECT 
    //         "DeviceReport".id,
    //         FLOOR((1000*EXTRACT(EPOCH FROM now() - "DeviceReport"."startDate")) / (1000 * EXTRACT(EPOCH FROM "reportLength"::interval))) as reports,
    //         COUNT("DeviceReportInstance"."id") as instances,
    //         max("DeviceReportInstance"."endDate") as "lastInstance"
    //     FROM "DeviceReport" 
    //     LEFT JOIN "DeviceReportInstance" 
    //     ON "DeviceReportInstance"."reportId" = "DeviceReport"."id"
    //     WHERE "DeviceReport"."recurring" = TRUE
    //     GROUP BY "DeviceReport"."id") as totals
    //     WHERE totals.instances < totals.reports
    // `


    const unfinishedReportInstances = await prisma.deviceReportInstance.findMany({
        where: {
            done: false
        },
        include: {
            report: {
                include: {
                    fields: {
                        include: {
                            device: true,
                            key: true
                        }
                    }
                }
            }
        }
    })

    if (recurring_reports?.length <= 0 && unfinishedReportInstances?.length <= 0) {
        console.log("No reports found that need compiling exiting succesfully now!");
        console.timeEnd('Compiling Reports');
        return true;
    }

    const reports = await prisma.deviceReport.findMany({
        where: {
            id: { in: recurring_reports?.map((x) => x.id) }
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


    for (var i = 0; i < reports.length; i++) {
        let report = reports[i];
        let { lastDate } = recurring_reports?.find((a) => a.id == report.id) || {};
        // if (!lastInstance) lastInstance = report.startDate;

        const duration = moment.duration(...(report?.reportLength?.split(' ') || []));

        const reportsNeeded = (moment.duration(moment.utc().diff(moment.utc(lastDate))) as any) / (duration as any)

        console.log(`${report.id} needs ${reportsNeeded}`)

        console.time(`Creating ${reportsNeeded} reports for ${report.deviceId} ${report.id}`)
        for (var r = 0; r < reportsNeeded; r++) {

            const durationType = report.reportLength?.split(' ')[1]
            const durationCount = parseFloat(report.reportLength?.split(' ')[0] || '0')

            let startMoment = moment.utc(new Date(lastDate)).add((r + 1) * durationCount, durationType as any);
            let endMoment = moment.utc(new Date(lastDate)).add((r + 1) * durationCount, durationType as any);

            if(durationType){
                startMoment.startOf(durationType as any)
                endMoment.endOf(durationType as any)
            }

            let startDate = startMoment.toDate()
            let endDate = endMoment.toDate()

            if(endDate > new Date()) continue; //Date range messed up it's trying to get to the future

            console.log("Compiling report for ", report.deviceId, report.id, " ", startDate, endDate);

            if (report.deviceId) {

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

                const { path } = await compileReport(prisma, id, report.deviceId, report, startDate, endDate) || {}

                if (path) {
                    const command = new PutObjectCommand({
                        Bucket: process.env.BUCKET || "test-bucket",
                        Key: `${id}.xlsx`,
                        Body: readFileSync(path),
                    });

                    try {
                        await client.send(command);
                    } catch (err) {
                        console.error("Error making S3 request", err);
                    }

                    await prisma.deviceReportInstance.update({
                        where: { id },
                        data: {
                            done: true
                        }
                    })
                } else {
                    await prisma.deviceReportInstance.delete({ where: { id } })
                }
            }

        }
        console.timeEnd(`Creating ${reportsNeeded} reports for ${report.deviceId} ${report.id}`)
    }

    console.time(`Creating ${unfinishedReportInstances.length} unfinished reports`)

    for (var i = 0; i < unfinishedReportInstances.length; i++) {
        const report = unfinishedReportInstances[i];

        let startDate = moment.utc(new Date(report.startDate)).toDate();
        let endDate = moment.utc(new Date(report.endDate)).toDate();

        console.log("Compiling report for ", report.report.deviceId, report.id, " ", startDate, endDate);

        if (report.report.deviceId) {

            const { path } = await compileReport(prisma, report.id, report.report.deviceId, report.report, startDate, endDate) || {}

            if (path) {
                const command = new PutObjectCommand({
                    Bucket: process.env.BUCKET || "test-bucket",
                    Key: `${report.id}.xlsx`,
                    Body: readFileSync(path),
                });

                try {
                    await client.send(command);
                } catch (err) {
                    console.error("Error making S3 request", err);
                }

                await prisma.deviceReportInstance.update({
                    where: { id: report.id },
                    data: {
                        done: true
                    }
                })
            } else {
                await prisma.deviceReportInstance.delete({ where: { id: report.id } })
            }
        }

    }
    console.timeEnd(`Creating ${unfinishedReportInstances.length} unfinished reports`)

    console.timeEnd('Compiling Reports');

})();