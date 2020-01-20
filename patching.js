const puppeteer = require('puppeteer');
const behaviour = require('./behaviour');
const fs = require('fs');
const yargs = require('yargs');

function readURLFile(path) {
    return fs.readFileSync(path).toString().split('\n');
}

const argv = yargs
    .usage('$0 <cmd> [args]')
    .command('patch', 'Launch puppeteer to patch arquivo.pt webarchives.', (yargs) => {
        yargs.option('num_browsers', {
            description: 'The number of browsers instances to use.',
            alias: 'b',
            type: 'number',
            default: 1
        })
        .option('num_pages', {
            description: 'The number of tabs pages for each browser instance top use.',
            alias: 'p',
            type: 'number',
            default: 1
        })
        .option('urls_list', {
            description: 'List of urls to patch.',
            alias: 'i',
            type: 'string',
            default: 'urls.txt'
        })
        .option( 'timeout', {
            description: 'browsing page timeout',
            alias: 't',
            type: 'number',
            default: 90000
        })
    })
    .help()
    .alias('help', 'h')
    .argv;


const num_browsers = argv.num_browsers
const num_pages = argv.num_pages
const urls_list = argv.urls_list;
const timeout = argv.timeout;

console.log("Lauching patching with %i browsers and %i page tabs.", num_browsers, num_pages);

(async () => {
    const initialTime = Date.now();
    const urls = readURLFile(urls_list);

    const promisesBrowsers = [];

    for (let numbBrowser=0; numbBrowser < num_browsers; numbBrowser++){
        promisesBrowsers.push(new Promise(async (resBrowser) => {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const promisesPages = [];

            for (let numPage = 0; numPage < num_pages; numPage++){
                promisesPages.push(new Promise(async (resPage) => {
                    while(urls.length > 0){
                        const url = urls.pop();
                        if (url != ''){
                         console.log("Patching URL", url);
                        let page = await browser.newPage();
                        page.setDefaultNavigationTimeout(timeout);
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