# puppeteer-webrender

Exposing an interface to render webpages through puppeteer.

### Starting

docker build . -t arquivo/webrender --force-rm
docker run -d -p "5000:5000" arquivo/webrender
```
The default container cmd is to expose two endpoints at port 9000:
- http://localhost:9000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
- http://localhost:9000/har?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/

### Generating full screenshot webpage
```
wget -O screenshot.jpeg http://localhost:9000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
available options:
- fullpage=<true or false>
- width=<value>
- height=<value>