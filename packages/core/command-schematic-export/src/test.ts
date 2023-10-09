import { export_schematic } from "."
import { writeFileSync } from 'fs';

export_schematic({
    name: 'Projec',
    version: '1',
    versionDate: '04/12/23',
    pages: [
        {
            id: '1',
            name: 'Page 1', 
            nodes: [
                {id: '1', type: 'electricalSymbol', position: {x: 0, y: 0}, data: {symbol: 'AcCoil'} }, 
                {id: '2', type: 'electricalSymbol', position: {x:  1800, y: 10}, data: {symbol: 'AcCoil'}  }
        ],
            edges: [{id: '2', type: 'wire', source: 'canvas', target: 'canvas', points: [{x: 50, y: 50}, {x: 100, y: 100}] }]
        },
        {id: '2', 
        name: 'Page 2', 
        nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
    ]
}, 297/210, {
    executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
    defaultViewport: {
        // "deviceScaleFactor":1,"hasTouch":false,
        "height":1080,
        // "isLandscape":true,"isMobile":false,
        "width":1920
    },
    
    headless: false,
    // args: ["--allow-running-insecure-content","--autoplay-policy=user-gesture-required","--disable-background-timer-throttling","--disable-component-update","--disable-domain-reliability","--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process","--disable-ipc-flooding-protection","--disable-print-preview","--disable-dev-shm-usage","--disable-setuid-sandbox","--disable-site-isolation-trials","--disable-speech-api","--disable-web-security","--disk-cache-size=33554432","--enable-features=SharedArrayBuffer","--hide-scrollbars","--ignore-gpu-blocklist","--in-process-gpu","--mute-audio","--no-default-browser-check","--no-first-run","--no-pings","--no-sandbox","--no-zygote","--use-gl=angle","--use-angle=swiftshader","--window-size=1920,1080","--single-process"]
    // viewport: {
    //     width: 600,
    //     height: 800
    // }


}).then((pdf: any) => {
        writeFileSync('./test.pdf', pdf)

})