# puppeteer-webrender

Exposing an interface to render webpages through puppeteer.

### Starting

```
docker build . -t arquivo/webrender . --force-rm
docker run -d -p "9000:9000" arquivo/webrender
```
The default container cmd is to expose two endpoints at port 9000:
- http://localhost:9000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
- http://localhost:9000/har?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/

### Generating full screenshot webpage
```
wget -O screenshot.jpeg http://localhost:9000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
### Generating web page har (QA purposes)
```
wget -O page.har http://localhost:9000/har?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
 
### Patching Webpages

Overwritting the default CMD, we can iterate through a list of urls for patching purposes or whatever. 
The default behaviour is just scrolldown.

```
docker run -it -v "<path_to_file_with_urls.txt>:/webrender/tmp/" arquivo/webrenderer patching.js tmp/urls.tx
```
