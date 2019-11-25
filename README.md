# puppeteer-webrender

Exposing an interface to render webpages through puppeteer.

### Starting

```
docker build . -t arquivo/webrender . --force-rm
docker run -d -p "9000:9000" arquivo/webrender
```

### Generating full screenshot webpage
```
wget -O screenshot.jpeg http://localhost:9000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
### Generating web page har (QA puporses)
```
wget -O page.har http://localhost:9000/har?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
 
