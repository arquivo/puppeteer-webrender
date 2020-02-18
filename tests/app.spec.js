const app_export = require('../app/app');
const supertest = require('supertest');

const request = supertest(app_export);

describe('Test GET /', () => {
    test('Service up satus code', async () => {        
        const res = await request.get('/');
        expect(res.status).toBe(200);
    });
});

describe('Test GET /screenshot', () => {
    test('Getting a screenshot image', async () => {
        const res = await request.get('/screenshot?url=https://arquivo.pt/noFrame/replay/19980205082901/http://www.caleida.pt/saramago/')
        expect(res.status).toBe(200);
        expect(res.header).toHaveProperty('content-type', 'image/png');
    });
    
    test('Getting a downloable screenshot image', async () => {
      const fileName = 'bemvindo-a-caleida-19980205082901.png'
      const res = await request.get('/screenshot?url=https://arquivo.pt/noFrame/replay/19980205082901/http://www.caleida.pt/&download=true');

      expect(res.status).toBe(200);
      expect(res.header).toHaveProperty('content-type', 'application/octect-stream');
      expect(res.header).toHaveProperty('content-disposition', `attachment; filename=${fileName}`);
    });

    test('Requesting a screenshot image with a specific resolution (800x800)', async () => {
        const res = await request.get('/screenshot?url=https://arquivo.pt/noFrame/replay/19980205082901/http://www.caleida.pt/saramago/&width=800&height=900');
        expect(res.status).toBe(200);
        expect(res.header).toHaveProperty('content-length', '124315');
    });

    test('Requesting not allowed domain url screenshot', async () => {
        const res = await request.get('/screenshot?url=https://sobre.arquivo.pt/');
        expect(res.status).toBe(405);
    });

    test('Requesting not fullpage screenshot', async () => {
        const res = await request.get('/screenshot?url=https://arquivo.pt/noFrame/replay/http://sobre.arquivo.pt&fullpage=false');
        expect(res.status).toBe(200);
        expect(res.header).toHaveProperty('content-length', '97536');
    }, 10000);

    test('Requesting page that needs URL Enconding', async () => {
        const res = await request.get('/screenshot?url=' + encodeURI('https://arquivo.pt/noFrame/replay/20170215220854/http://www.cidadao.gov.ao/VerServicoPDFPrint.aspx?id=209&tipo=imprimir') + '&download=true');
        expect(res.status).toBe(200);
        expect(res.header).toHaveProperty('content-type', 'application/octect-stream');
        expect(res.header).toHaveProperty('content-disposition', `attachment; filename=${fileName}`);
    })
})