const puppeteer = require('puppeteer');

async function renderScreenshot(page, url, type, width, height, fullPage, timeout) {
    page.setDefaultTimeout(timeout);

    await page.goto(url, {waitUntil: 'load'}).catch((err) => {
        console.log('Something went wrong loading page', url, err);
        browser.close();
        return err;
    });

    await page.setViewport({
        width: width,
        height: height
    })
    
    const pageTitle = await page.title();
    let result = await page.screenshot({type: type, fullPage: fullPage}).catch((err) => {
        console.log('Something went wrong screenshoting the page', url, err);
        return err;
    });

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