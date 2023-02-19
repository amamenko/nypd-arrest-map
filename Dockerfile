FROM ghcr.io/puppeteer/puppeteer:16.1.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./ 
RUN npm ci --omit=dev
RUN cd Client && npm install --legacy-peer-deps && npm run build && cd ..
COPY . .
CMD [ "node", "index.js" ]