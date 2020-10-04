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
  console.info("Websocket connection open.");
  ws.send("Websocket connection open.");

  ws.on("message", (message) => {
    const decodedMessage = decoder.write(Buffer.from(message));

    if (yearlyTotals[decodedMessage]) {
      const bucket = storage.bucket(`${decodedMessage}_nypd_arrest_data`);

      const stream = bucket.file(`${decodedMessage}.json`).createReadStream();

      let chunkArr = [];
      let totalLength = 0;

      oboe(stream).node(
        "{ARREST_DATE PD_DESC OFNS_DESC LAW_CAT_CD ARREST_BORO AGE_GROUP PERP_SEX PERP_RACE Latitude Longitude}",
        (chunk) => {
          chunkArr.push(chunk);
          totalLength++;

          if (
            chunkArr.length === 30000 ||
            totalLength === yearlyTotals[decodedMessage]
          ) {
            console.log(chunkArr.length);
            const compressedJSON = LZString.compressToEncodedURIComponent(
              JSON.stringify(chunkArr)
            );

            ws.send(compressedJSON);
            chunkArr = [];
          }

          return oboe.drop;
        }
      );
    }
  });

  ws.on("close", () => console.log("WebSocket closed"));
});

server.listen(port, () => console.log("Listening to port " + port));
