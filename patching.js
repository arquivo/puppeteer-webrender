const puppeteer = require('puppeteer');
const behaviour = require('./behaviour');
const fs = require('fs');

const num_browsers = 2;
const num_pages = 3;

function readURLFile(path) {
    return fs.readFileSync(path, 'utf-8').split('\n');
}

(async () => {
    const initialTime = Date.now();
    console.log(process.argv[2])
    const urls = readURLFile(process.argv[2]);

    const promisesBrowsers = [];

    for (let numbBrowser=0; numbBrowser < num_browsers; numbBrowser++){
        promisesBrowsers.push(new Promise(async (resBrowser) => {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const promisesPages = [];

            for (let numPage = 0; numPage < num_pages; numPage++){
                promisesPages.push(new Promise(async (resPage) => {
                    while(urls.length > 0){
                        const url = urls.pop();
                        console.log("Patching URL", url);
                        let page = await browser.newPage();
                        page.setDefaultNavigationTimeout(90000);
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

                    resPage()
                }));
            }

            await Promise.all(promisesPages);
            await browser.close();
            resBrowser();
        }));
    }
    await Promise.all(promisesBrowsers);
    console.log("Total Elapsed Time:", Date.now() - initialTime);
})();