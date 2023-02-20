FROM node:10 AS ui-build

WORKDIR /usr/src/app
COPY Client/ ./Client/
RUN cd Client && \
    npm install --legacy-peer-deps && \
    REACT_APP_CONTENTFUL_ACCESS_TOKEN=$REACT_APP_CONTENTFUL_ACCESS_TOKEN \
    REACT_APP_CONTENTFUL_SPACE_ID=$REACT_APP_CONTENTFUL_SPACE_ID \
    REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN \
    npm run build

FROM ghcr.io/puppeteer/puppeteer:16.1.0 AS server-build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app
RUN mkdir Client
COPY --from=ui-build /usr/src/app/Client/build ./Client/build
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD [ "node", "index.js" ]