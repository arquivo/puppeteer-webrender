const express = require('express');
const puppeteer = require('puppeteer');
const PuppeteerHar = require('puppeteer-har');
const behaviour = require('./behaviour');

const app = express();
const port = process.argv[2];

async function renderScreenshot(url) {
    // should change this
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'load', timeout: 10000}).then(() => {
        console.log('Success loading page', url)
    }).catch((err) => {
        console.log('Something went wrong loading page', url, err)
        browser.close()
        return err;
    });

    let result = await page.screenshot({type: 'jpeg', fullPage: true});

    await browser.close();

    return result;
}

app.get('/screenshot', (request, response, next) => {
    // render?url=http....
    console.log("Rendering screenshot for: ", request.query.url);
    renderScreenshot(request.query.url)
        .then((res) => response.set('Content-Type', 'image/jpeg').send(res))
        .catch(error => next(error))
});

async function generateHar(url) {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(url, 'networkidle2');

    const har = new PuppeteerHar(page);
    await har.start();
    await page.goto(url)

    // Switch through a few widths to encourage JS-based responsive image loading:
    console.log("Setting viewport to: 480x1024");
    await page.setViewport({
        width: 480,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });
    console.log("Setting viewport to: 640x1024");
    await page.setViewport({
        width: 640,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });
    console.log("Setting viewport to: 800x1024");
    await page.setViewport({
        width: 800,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });
    console.log("Setting viewport to: 1024x1024");
    await page.setViewport({
        width: 1024,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });

    // Switch back to the standard device view:
    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });

    console.log("Auto scrolling page...");
    await behaviour.autoScroll(page);

    let res_har = await har.stop();

    await browser.close();

    return res_har;
}

app.get('/har', (request, response) => {
    console.log("Rendering page and generating HAR...")
    generateHar(request.query.url)
        .then(res => response.set('Content-Type', 'application/json').send(res))
        .catch((error) => next(error))
});


app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err)
    }
    console.log(`server is listening on ${port}`)
});