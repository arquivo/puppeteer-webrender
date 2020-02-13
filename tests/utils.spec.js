const { removeDiacritics } = require('../app/utils');
const { extractTimeWaybackUrl } = require('../app/utils');

test("Test timestamp extraction from wayback Url", () => {
    const testUrl1 = "https://arquivo.pt/wayback/19980205082901/http://www.caleida.pt/saramago/";
    const testUrl2 = "https://arquivo.pt/wayback/19980205/http://www.caleida.pt/saramago";
    const testUrl3 = "https://arquivo.pt/wayback/http://www.caleida.pt/saramago";

    expect(extractTimeWaybackUrl(testUrl1)).toBe("19980205082901");
    expect(extractTimeWaybackUrl(testUrl2)).toBe("19980205");
    expect(extractTimeWaybackUrl(testUrl3)).toBeNull();
});

test("Test if diacritics are removed", () =>{
    const weird_string = "Some weird title n\u0061me";
    expect(removeDiacritics(weird_string) === "Some weird title name");
})