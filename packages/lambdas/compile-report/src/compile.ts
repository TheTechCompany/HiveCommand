import { unit as mathUnit } from 'mathjs';
import * as xlsx from 'xlsx'
import { writeFileSync } from 'fs';
import moment from 'moment';
import path from 'path';
import { Prisma, PrismaClient } from '@hive-command/data';

export const compileReport = async (
    prisma: PrismaClient,
    id: string,
    deviceId: string, 
    report: {fields: any[]}, 
    startDate: Date, 
    endDate: Date
) => {


    console.time(`Creating workbook ${id}`)

    const workbook = xlsx.utils.book_new();

    const fields = (report?.fields || []).filter((a) => a.bucket && a.device);

    for(var i = 0; i < (fields || []).length; i++){
        const field = fields[i];

        console.time(`Creating worksheet ${i}-${id}`)

        const period = mathUnit(field.bucket || '1 minute').toNumber('seconds');

        // console.log(
        //     `
        //     SELECT placeholder, key, avg(value::float) as value, time_bucket(${period}::decimal * '1 second'::interval, "lastUpdated") as time FROM "DeviceValue" WHERE "deviceId" = ${deviceId} AND placeholder=${field.device?.name} ${field.key ? ` AND key=${field.key?.name}` : ''} AND "lastUpdated" > ${startDate} AND "lastUpdated" < ${endDate}
        // `)


        const result : any[] = await prisma.$queryRaw`
            SELECT placeholder, key, locf(avg(value::float)) as value, time_bucket_gapfill(${period}::decimal * '1 second'::interval, "lastUpdated")  as time
                FROM "DeviceValue" 
            WHERE 
                "deviceId" = ${deviceId} AND 
                placeholder=${field.device?.name} 
                ${field.key ? Prisma.sql` AND key=${field.key?.name}` : Prisma.empty} 
                AND "lastUpdated" > ${startDate} 
                AND "lastUpdated" < ${endDate}
                GROUP BY placeholder, key, time ORDER BY time ASC
        `

        const sheet = xlsx.utils.json_to_sheet(result.map((x) => ({
            ...x, 
            date: moment(new Date(x.time)).format('DD/MM/YYYY - hh:mma'), 
            time: new Date(x.time).getTime() 
        })));

        xlsx.utils.book_append_sheet(workbook, sheet, `${field.device?.name}${field.key ? '.'+ field.key?.name : ''}`)

        console.timeEnd(`Creating worksheet ${i}-${id}`)
    }

    console.timeEnd(`Creating workbook ${id}`)

    try{

        const xlsxPath = path.join(__dirname, `${id}.xlsx`);

        xlsx.writeFile(workbook, xlsxPath);

        return {path: xlsxPath, id};

    }catch(err){
        return null;
    }
}