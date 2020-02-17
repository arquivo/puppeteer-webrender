const express = require('express');
const render = require('./render');
const utils = require('./utils');
const { Cluster } = require('puppeteer-cluster');

// launch server
const app = express();
const port = process.env.PORT || 5000;
const allowedDomains = process.env.ALLOWED_DOMAINS || ['arquivo.pt']
const timeout = process.env.SCREENSHOT_TIMEOUT || 60000; 
const type = process.env.SCREENSHOT_TYPE || 'png';
const maxConcurrency = process.env.MAX_CONCURRENCY || 5;

let width = process.env.SCREENSHOT_WIDTH || 1280;
let height = process.env.SCREENSHOT_HEIGHT || 900;

(async () => {
    // launch puppetter cluster
    const cluster = await Cluster.launch({
        // FIXME we should be able to run this in a container with sandbox mode
        puppeteerOptions: {args: ['--no-sandbox', '--disable-setuid-sandbox'] },  
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: maxConcurrency,
    })

    // TODO make this a isolated function, to be testable.
    await cluster.task(async ({ page, data: parametersObject }) => {
        page.setDefaultTimeout(parametersObject.timeout);

        await page.goto(parametersObject.url, {waitUntil: 'load'}).catch((err) => {
            console.log('Something went wrong loading page', url, err);
            browser.close();
            return err;
        });
    
        await page.setViewport({
            width: parametersObject.width,
            height: parametersObject.height
        })
        
        const pageTitle = await page.title();
        let result = await page.screenshot({type: parametersObject.type, fullPage: parametersObject.fullPage}).catch((err) => {
            console.log('Something went wrong screenshoting the page', url, err);
            return err;
        });
    
        return [ pageTitle, result ];
    });

    app.listen(port, (err) => {
        if (err) {
            return console.log("something bad happened", err)
        }
    });

    // middleware always takes (req, res, next) next is the next middleware function
    app.get('/', (request, response, next) => {
        response.status(200).send("OK - Service Ready")
    })

    app.get('/screenshot', (request, response, next) => {
        width = isNaN(request.query.width) ? width : parseInt(request.query.width);
        height = isNaN(request.query.height) ? height : parseInt(request.query.height);

        let fullPage = (request.query.fullpage == null) ? true : utils.textBoolean(request.query.fullage);

        // verify if root domain match. if not allowed return forbidden operation. if not continue.
        let validUrl = render.validateUrl(request.query.url, allowedDomains);
        if (!validUrl){
            response.status(405).send("Wrong root domain to execute the screenshot.");
        }
        else {
            var parametersObject = new Object();
            parametersObject.url = request.query.url;
            parametersObject.type = type;
            parametersObject.width = width;
            parametersObject.height = height;
            parametersObject.fullPage = fullPage;
            parametersObject.timeout = timeout;

            cluster.execute(parametersObject)
                .then((res) => {
                    screenshotContent = res[1];
                    if (request.query.download) {
                        let timestamp = utils.extractTimeWaybackUrl(request.query.url);
                        let ts = timestamp != null ? `-${timestamp}` : '';

                        // TODO ugh refactor this
                        fileName = utils.removeDiacritics(res[0]).replace(/[^a-z0-9]/gi, '-').replace(/[-]+/g,'-').toLowerCase().substring(0,30) + ts +'.png';
                        response.set("Content-Disposition", `attachment; filename=${fileName}`)
                            .set('Content-Type', 'application/octect-stream')
                            .send(screenshotContent);
                    }
                    else {
                        response.set('Content-Type', 'image/' + type).send(screenshotContent)
                    }
                })
                .catch( error => {
                    response.status(500).send("Something went wrong taking the screenshot.");
                });
        }    
    });
})()

module.exports = app;