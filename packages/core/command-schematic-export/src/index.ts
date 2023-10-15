import puppeteer, { KnownDevices } from 'puppeteer-core';
import path from 'path';
import express from 'express';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const html_index = require.resolve('@hive-command/export-page');

export const export_schematic = async (schematic: {
    name: string, 
    pages: any[], 
    version: string, 
    versionDate: string
}, ratio?: number, puppeteerArgs?: any) => {

    console.log(JSON.stringify(puppeteerArgs));

    const pages = (schematic?.pages || []).sort((a,b) => (a.rank || '').localeCompare(b.rank || ''));

    console.log("Creating PDF Doc...");

    const pdfDoc = await PDFDocument.create();
    
    console.log("Created PDF Doc!");

    console.log("Starting Express...");

    const app = express();

    app.use(express.static(path.dirname(html_index)));


    app.get('/schematic/pages/:ix', (req, res) => {
        console.log("GET", req.params.ix,  pages?.[parseInt(req.params.ix)] );
        res.send({
            project: {
                name: schematic.name,
                version: `v${schematic?.version} - ${schematic?.versionDate}`

            },
            page: pages?.[parseInt(req.params.ix)],
            pageNumber: parseInt(req.params.ix) + 1
        } );

    })

    return await new Promise((resolve, reject) => {
        const listener = app.listen(0, async () => {
            const address = listener.address();


            if(typeof(address) != 'string'){
                console.log("Started Express! - " + address?.port);
    
                    console.log("Launching browser...");

                    const browser = await puppeteer.launch({
                        ...puppeteerArgs,
                        // defaultViewport: null
                        defaultViewport: {
                            width: 1120,
                            height: 793
                        }
                    });
    
                    console.log("Launched browser!");

                    const browserPage = await browser.newPage();

                    const viewport = browserPage.viewport();

                    console.log(viewport?.width, viewport?.height)

                    // browserPage.setViewport({ width: 1122, height: parseInt(`${1122 * (210/297)}`)  })

                    // const iphone = KnownDevices['iPhone 11 Pro Max']
                    
                    // await browserPage.emulate({viewport: {width: 1920, height: ratio ? parseInt(`${1920 / ratio}`) : 1080}, userAgent: ''})

                    await browserPage.goto(`http://localhost:${address?.port}#ix=-1`)
                    
                    //@ts-ignore
                    await browserPage.waitForSelector('.pre-loaded');

                    let pdfPages = [];
                    
                    for(var i = 0; i < pages.length; i++){

                        let page = pages[i];

                        console.log("Loading pages", i)

                        browserPage.goto(`http://localhost:${address?.port}#ix=${i}&width=${1120}&height=${(1120 * (210/297))?.toFixed(0)}`)
                        
                        // //@ts-ignore
                        // await browserPage.waitForSelector<any>('.loading');
 
                        // await 
                        //@ts-ignore
                        await browserPage.waitForSelector<any>(".loaded")

                        const pdfData = await browserPage.pdf({format: 'A4', landscape: true});

                        // await new Promise((resolve) => setTimeout(() => resolve(true), 1 *1000))
                        
                        pdfPages.push(pdfData);
                        
                    }

                    // const page = await browser.newPage();

                    // console.log(page.viewport());

                    // page.setViewport({ width: 1920, height: ratio ? parseInt(`${1920 / ratio}`) : 1080 });

                    for(var i = 0; i < pdfPages.length; i++){
    
                        // console.log(`Exporting page ${i}...`);

                        // await page.goto(`http://localhost:${address?.port}#ix=${i}`)
    
                        // console.log(`Exporting page ${i} - OnPage.`);
    
                        // // await page.
                        // //@ts-ignore
                        // await page.waitForSelector<any>(".loaded")
    
                        // await new Promise((resolve) => setTimeout(() => resolve(true), 500));
                        
                        // console.log(`Exporting page ${i} - Waited.`);
    
                        // const pdfData = await page.pdf({format: 'A4', landscape: true});
                        // console.log(`Exporting page ${i} - PDF'd.`);
                        
                        const pdfPage = await PDFDocument.load(pdfPages[i])
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


