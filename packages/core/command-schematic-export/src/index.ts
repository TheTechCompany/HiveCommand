import puppeteer from 'puppeteer-core';
import path from 'path';
import express from 'express';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const html_index = require.resolve('@hive-command/export-page');

export const export_schematic = async (schematic: {name: string, pages: any[]}, ratio?: number, puppeteerArgs?: any) => {

    console.log(JSON.stringify(puppeteerArgs));

    const pages = (schematic?.pages || []).sort((a,b) => (a.rank || '').localeCompare(b.rank || ''));

    console.log("Creating PDF Doc...");

    const pdfDoc = await PDFDocument.create();
    
    console.log("Created PDF Doc!");

    console.log("Starting Express...");

    const app = express();

    app.use(express.static(path.dirname(html_index)));


    app.get('/schematic/pages/:ix', (req, res) => {

        res.send({
            project: schematic.name,
            page: pages?.[parseInt(req.params.ix)] 
        } );

    })

    return await new Promise((resolve, reject) => {
        const listener = app.listen(0, async () => {
            const address = listener.address();


            if(typeof(address) != 'string'){
                console.log("Started Express! - " + address?.port);
    
                    console.log("Launching browser...");

                    const browser = await puppeteer.launch({
                        ...puppeteerArgs
                    });
    
                    console.log("Launched browser!");

                    const page = await browser.newPage();

                    console.log(page.viewport());

                    page.setViewport({ width: 1920, height: ratio ? parseInt(`${1920 / ratio}`) : 1080 });

                    for(var i = 0; i < pages.length; i++){
    
                        console.log(`Exporting page ${i}...`);

                        await page.goto(`http://localhost:${address?.port}#ix=${i}`)
    
                        console.log(`Exporting page ${i} - OnPage.`);
    
                        // await page.
                        //@ts-ignore
                        await page.waitForSelector<any>(".loaded")
    
                        await new Promise((resolve) => setTimeout(() => resolve(true), 500));
                        
                        console.log(`Exporting page ${i} - Waited.`);
    
                        const pdfData = await page.pdf({format: 'A4', landscape: true});
                        console.log(`Exporting page ${i} - PDF'd.`);
                        
                        const pdfPage = await PDFDocument.load(pdfData)
                        console.log(`Exporting page ${i} - Loaded to PDF.`);
    
                        const copiedPages = await pdfDoc.copyPages(pdfPage, [0]);
                        copiedPages.forEach((page) => {
                            pdfDoc.addPage(page); 
                        }); 
                        console.log(`Exporting page ${i} - Copied to PDF.`);

    
                        console.log(`Exported page ${i}!`);

    
                    }
                    console.log(`Exporting PDF...`);
    
                    const pdfBuffer = await pdfDoc.save()
    
                    console.log(`Exported PDF!`);

                    // writeFileSync(outputPath, pdfBuffer)
                    // console.log(`Write PDF!`);
    
                    browser.close();
                    listener.close();

                    console.log(`Close!`);

                    resolve(pdfBuffer);
    
            }
        })
    });
    

   

}


