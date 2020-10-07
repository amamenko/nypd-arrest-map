const express = require("express");
const app = express();
const WebSocket = require("ws").Server;
const server = require("http").createServer();
const { Storage } = require("@google-cloud/storage");
const compression = require("compression");
const oboe = require("oboe");
const yearlyTotals = require("./YearlyTotalsNode");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");
const LZString = require("lz-string");
const path = require("path");
const JSONfn = require("json-fn");

require("dotenv").config();

// compress responses
app.use(compression());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("Client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./Client", "build", "index.html"));
  });
}

const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const port = process.env.PORT || 4000;

const storage = new Storage({
  credentials: require("./nypd-arrest-map-details.js"),
});

const wss = new WebSocket({ server });

server.on("request", app);

wss.on("connection", (ws) => {
  console.log("Websocket successfully connected");

  ws.on("message", (message) => {
    const decodedMessage = decoder.write(Buffer.from(message));
    const decompressedMessage = LZString.decompressFromEncodedURIComponent(
      decodedMessage
    );

    if (decompressedMessage && decompressedMessage !== ".") {
      const parsedMessage = JSONfn.parse(decompressedMessage.trim());

      const year = parsedMessage.year;
      let currentLoadDataChunks = parsedMessage.currentLoadDataChunks;

      if (yearlyTotals[year]) {
        const bucket = storage.bucket(`${year}_nypd_arrest_data`);

        const stream = bucket.file(`${year}.json`).createReadStream();

        let chunkArr = [];
        let totalLength = 0;

        oboe(stream).node(
          "{ARREST_DATE PD_DESC OFNS_DESC LAW_CAT_CD ARREST_BORO AGE_GROUP PERP_SEX PERP_RACE Latitude Longitude}",
          (chunk) => {
            chunkArr.push(chunk);
            totalLength++;

            if (
              chunkArr.length === 30000 ||
              totalLength === yearlyTotals[year]
            ) {
              console.log(chunkArr.length);

              if (!currentLoadDataChunks[year.toString()]) {
                Object.assign(currentLoadDataChunks, {
                  [year.toString()]: [chunkArr],
                });
              } else {
                currentLoadDataChunks[year.toString()].push(chunkArr);
              }

              const splitChunks = Object.keys(currentLoadDataChunks).map(
                (item) => {
                  return { [item]: currentLoadDataChunks[item] };
                }
              );

              const loadedDataArr = splitChunks.map((x) => {
                const keyName = Object.keys(x)[0];

                let flattenedArray = [];

                for (let i = 0; i < x[keyName].length; i++) {
                  let currentValue = x[keyName][i];
                  for (let j = 0; j < currentValue.length; j++) {
                    flattenedArray.push(currentValue[j]);
                  }
                }
                return flattenedArray;
              });

              const compressedRes = LZString.compressToEncodedURIComponent(
                JSON.stringify({
                  newDataChunks: currentLoadDataChunks,
                  loadedDataArr: loadedDataArr,
                })
              );

              ws.send(compressedRes);
              chunkArr = [];
            }

            return oboe.drop;
          }
        );
      }
    }
  });

  ws.on("close", () => console.log("WebSocket closed"));
});

server.listen(port, () => console.log("Listening to port " + port));
