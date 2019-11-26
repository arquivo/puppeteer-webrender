const puppeteer = require('puppeteer');
const behaviour = require('./behaviour');
const fs = require('fs');

function readURLFile(path) {
    return fs.readFileSync(path, 'utf-8').split('\n')
        .map((elt) => {
            return elt;
        });
}

(async () => {
    console.log(process.argv[2])
    const urls = readURLFile(process.argv[2]);

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

    for (const url of urls) {
         console.log("Patching URL", url);
        //let url = url.toString().trim();
        let page = await browser.newPage();
        let before = Date.now();

        try{
            await page.goto(url, 'networkidle2');

            console.log("Auto scrolling page", url);
            await behaviour.autoScroll(page);

            console.log("Elapsed", Date.now() - before, "ms")
        } catch(err) {
            console.log("Something went wrong with", url, err)
        } finally {
            await page.close();
        }
    }

    await browser.close();
})();