FROM node:12-slim

RUN apt-get update \
     && apt-get install -y wget --no-install-recommends \
     && apt-get install -y gnupg gnupg1 gnupg2

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

RUN apt-get update \
     && apt-get install -y libxext6:amd64 google-chrome-stable --no-install-recommends

RUN rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash webrender

WORKDIR /webrender

RUN chown -R webrender:webrender .

USER webrender

COPY . .

RUN npm install

ARG PORT=5000

ENV PORT=$PORT

CMD node app/start.js