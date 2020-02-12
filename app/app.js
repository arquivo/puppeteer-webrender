const express = require('express');
const render = require('./render');
const utils = require('./utils');

// launch server
const app = express();
const port = process.env.PORT || 5000;
const allowedDomains = process.env.ALLOWED_DOMAINS || ['arquivo.pt']
let width = process.env.SCREENSHOT_WIDTH || 1280;
let height = process.env.SCREENSHOT_HEIGHT || 900;
const timeout = process.env.SCREENSHOT_TIMEOUT || 10000; 


app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err)
    }
    console.log(`Server is listening on ${port}`)
});

// middleware always takes (req, res, next) next is the next middleware function
app.get('/', (request, response, next) => {
    response.status(200).send("OK - Service Ready")
})

app.get('/screenshot', (request, response, next) => {
    console.log("Check if is a valid URL.")
    // validate url logic here

    console.log("Rendering screenshot for: ", request.query.url);
    // TODO Change this to make a downloable file instead

    width = isNaN(request.query.width) ? width : parseInt(request.query.width)
    height = isNaN(request.query.height) ? height : parseInt(request.query.height)
    
    // verify if root domain match. if not allowed return forbidden operation. if not continue.
    let validUrl = render.validateUrl(request.query.url, allowedDomains);
    if (!validUrl){
        response.status(405).send('Method not Allowed')
    }
    else {
        render.renderScreenshot(request.query.url, width, height, timeout)
            .then((res) => {
                screenshotContent = res[1];
                if (request.query.download) {
                    let timestamp = utils.extractTimeWaybackUrl(request.query.url);
                    let ts = timestamp != null ? `-${timestamp}` : '';
                    fileName = utils.removeDiacritics(res[0]).replace(/[^a-z0-9]/gi, '-').replace(/[-]+/g,'-').toLowerCase().substring(0,30) + ts +'.jpeg';
                    response.set("Content-Disposition", `attachment; filename=${fileName}`)
                        .set('Content-Type', 'application/octect-stream')
                        .send(screenshotContent);
                }
                else {
                    response.set('Content-Type', 'image/jpeg').send(screenshotContent)
                }
            })
            .catch(error => next(error))
    }    
});

// response Content-dispo