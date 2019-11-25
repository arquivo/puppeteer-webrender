const express = require('express');
const puppeteer = require('puppeteer');
const PuppeteerHar = require('./puppeteer-har');

const app = express();
const port = process.argv[2];

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 4000) {
                    clearInterval(timer);
                    // Scroll back to the top:
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, 200);
        });
    });
}

async function renderScreenshot(url) {
    // should change this
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'load', timeout: 10000}).then(() =>{
        console.log('Success loading page', url)
    }).catch((res) => {
        console.log('Something went wrong loading page', url, res)
        browser.close()
        throw res
    });

    let result = await page.screenshot({type: 'jpeg', fullPage: true});

    await browser.close();

    return result;
}

app.get('/screenshot', (request, response) => {
    // render?url=http....
    console.log("Rendering screenshot for: ", request.query.url);
    renderScreenshot(request.query.url).then( res => {
        if (res){
            response.set('Content-Type', 'image/jpeg').send(res)
        }
        else {
            response.status(500);
            response.send("Something went wrong rendering the page!!")
        }
        }
    );
});

async function generateHar(url){
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(url, 'networkidle2');

    const har = new PuppeteerHar(page);
    har.start();

    // Switch through a few widths to encourage JS-based responsive image loading:
    console.log("Setting viewport to: 480x1024");
    await page.setViewport({ width: 480, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false, isLandscape: false});
    console.log("Setting viewport to: 640x1024");
    await page.setViewport({ width: 640, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false, isLandscape: false});
    console.log("Setting viewport to: 800x1024");
    await page.setViewport({ width: 800, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false, isLandscape: false});
    console.log("Setting viewport to: 1024x1024");
    await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false, isLandscape: false});

    // Switch back to the standard device view:
    await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false, isLandscape: false});

    console.log("Auto scrolling page...");
    await autoScroll(page);

    let res_har = await har.stop();

    await browser.close();

    return res_har;
}

app.get('/har', (request, response) => {
    console.log("Rendering page and generating HAR...")
    generateHar(request.query.url).then(res => {
        if (res){
            response.set('Content-Type', 'application/json').send(res)
        }
        else {
            response.status(500);
            response.send("Something went wrong rendering the page!!")
        }
    });
});


app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err)
    }
    console.log(`server is listening on ${port}`)
});