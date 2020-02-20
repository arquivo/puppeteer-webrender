# puppeteer-webrender

Exposing an interface to render webpages through puppeteer.

### Starting

docker build . -t arquivo/webrender --force-rm
docker run -d -p "5000:5000" arquivo/webrender
```
The default container cmd exposes screenshost endpoint on port 5000
- http://localhost:5000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/

### Generating full screenshot webpage
```
wget -O screenshot.jpeg http://localhost:5000/screenshot?url=https://arquivo.pt/noFrame/replay/2018/http://www.publico.pt/
```
available options:
- download=<true or false> (default: true)
- fullpage=<true or false> (default: false)
- width=<value> (default: 1280)
- height=<value> (default: 900)
