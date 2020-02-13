const { validateUrl } = require('../app/render');
const { renderScreenshot } = require('../app/render');


test("Test if validateUrl is working correctly", () => {
    const testUrl1 = "http://covesantigas.com/image.jpg";
    const testUrl2 = "http://arquivo.pt/wayback/2018/http://sapo.pt";
    const allowedDomains = ['arquivo.pt','covesantigas.com'];

    expect(validateUrl(testUrl1, allowedDomains)).toBeTruthy();
    expect(validateUrl(testUrl2, allowedDomains)).toBeTruthy();
});

const getMimetype = (signature) => {
    switch (signature) {
        case '89504E47':
            return 'image/png'
        case '47494638':
            return 'image/gif'
        case '25504446':
            return 'application/pdf'
        case 'FFD8FFDB':
        case 'FFD8FFE0':
        case 'FFD8FFE1':
            return 'image/jpeg'
        case '504B0304':
            return 'application/zip'
        default:
            return 'Unknown filetype'
    }
};

test("Test screenshot rendering", () => {
    return renderScreenshot('https://arquivo.pt/noFrame/replay/20200117173921/http://senior3045.ipportalegre.pt/', 'png', 1280, 900, 10000).then( res => {
        expect(res[0]).toBe('Senior3045 Home page');

        const uint = new Uint8Array(res[1]);
        let bytes = [];
        uint.forEach((byte) => {
            bytes.push(byte.toString(16))
        });
        const hex = bytes.join('').toLocaleUpperCase();
        expect(getMimetype(hex.slice(0,8))).toBe('image/png');
    })
});