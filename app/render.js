const puppeteer = require('puppeteer');

async function renderScreenshot(url, width, height, timeout) {
    // should change this
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'load', timeout: timeout}).then(() => {
        console.log('Success loading page', url)
    }).catch((err) => {
        console.log('Something went wrong loading page', url, err);
        browser.close();
        return err;
    });

    await page.setViewport({
        width: width,
        height: height
    })
    
    const pageTitle = await page.title();
    let result = await page.screenshot({type: 'jpeg', fullPage: true});

    await browser.close();

    return [ pageTitle, result ];
}

function validateUrl(urlParameter, allowedDomains){        
    let url = new URL(urlParameter);
    const host = url.host;
    let result = false;

    allowedDomains.forEach(element => {
        if (host == element) result = true;
    });
    return result;
}

module.exports.validateUrl = validateUrl;
module.exports.renderScreenshot = renderScreenshot;
