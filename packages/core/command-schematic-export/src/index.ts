import puppeteer from 'puppeteer-core';
import path from 'path';
import express from 'express';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const html_index = require.resolve('@hive-command/export-page');

export const export_schematic = async (schematic: {name: string, pages: any[]}, puppeteerArgs?: any) => {

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
    
                        const copiedPages = await pdfDoc.copyPages(pdfPage, pdfPage.getPageIndices());
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

// export_schematic({
//     name: 'Projec',
//     pages: [
//         {
//             id: '1', 
//             nodes: [
//                 {id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, 
//                 {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} 
//             }
//         ],
//             edges: [{id: '2', type: 'wire', source: 'canvas', target: 'canvas', points: [{x: 50, y: 50}, {x: 100, y: 100}] }]
//         },
//         {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
//     ]
// }, {
//     executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
//     defaultViewport: {
//         "deviceScaleFactor":1,"hasTouch":false,"height":1080,"isLandscape":true,"isMobile":false,"width":1920
//     },
//     headless: false,
//     args: ['--window-size=1920,1080']
//     // viewport: {
//     //     width: 600,
//     //     height: 800
//     // }
// }).then((pdf: any) => {
//         writeFileSync('./test.pdf', pdf)

// })