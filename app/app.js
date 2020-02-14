const express = require('express');
const render = require('./render');
const utils = require('./utils');

// launch server
const app = express();
const port = process.env.PORT || 5000;
const allowedDomains = process.env.ALLOWED_DOMAINS || ['arquivo.pt']
const timeout = process.env.SCREENSHOT_TIMEOUT || 20000; 

let width = process.env.SCREENSHOT_WIDTH || 1280;
let height = process.env.SCREENSHOT_HEIGHT || 900;


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
        render.renderScreenshot(decodeURI(request.query.url), 'png', width, height, fullPage, timeout)
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
                    response.set('Content-Type', 'image/png').send(screenshotContent)
                }
            })
            .catch(error => next(error))
    }    
});

module.exports = app;