import puppeteer from 'puppeteer';
import path from 'path';
import express from 'express';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

export const export_schematic = async (schematic: {pages: any[]}) => {

    const pages = (schematic?.pages || []).sort((a,b) => (a.rank || '').localeCompare(b.rank || ''));

    const pdfDoc = await PDFDocument.create();

    const app = express();

    app.use(express.static(path.join(__dirname, 'export-page/build')));

    app.get('/schematic/pages/:ix', (req, res) => {

        res.send( {
            page: pages?.[parseInt(req.params.ix)] 
        } );

    })

    const listener = app.listen(0, async () => {
        const address = listener.address();

        if(typeof(address) != 'string'){
            console.log(address?.port)

                const browser = await puppeteer.launch({headless: false});

                const page = await browser.newPage();

                for(var i = 0; i < pages.length; i++){

                    await page.goto(`http://localhost:${address?.port}#ix=${i}`)

                    // await page.
                    //@ts-ignore
                    await page.waitForSelector<any>(".loaded")

                    await new Promise((resolve) => setTimeout(() => resolve(true), 500));

                    const pdfData = await page.pdf({format: 'A4', landscape: true});
                    
                    const pdfPage = await PDFDocument.load(pdfData)

                    const copiedPages = await pdfDoc.copyPages(pdfPage, pdfPage.getPageIndices());
                    copiedPages.forEach((page) => {
                        pdfDoc.addPage(page); 
                    }); 


                }


                const pdfBuffer = await pdfDoc.save()

                writeFileSync(path.join(__dirname, 'test.pdf'), pdfBuffer)
                // await browser.close();

                // listener.close()

        }
    })

   

}

export_schematic({
    pages: [
        {id: '1', nodes: [{id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} }]},
        {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
    ]
})