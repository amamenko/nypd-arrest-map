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
const path = require("path");
const enforce = require("express-sslify");
const csv = require("csvtojson");
const request = require("request");
const puppeteer = require("puppeteer");
const fs = require("fs");
const dayjs = require("dayjs");
const cron = require("node-cron");

require("dotenv").config();

// compress responses
app.use(compression());

const cors = require("cors");

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://nypd-arrest-map.herokuapp.com"
      : "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
const port = process.env.PORT || 4000;

if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));

  app.use(express.static("Client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "build", "index.html"));
  });
}

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: require("./nypd-arrest-map-details.js"),
});

const wss = new WebSocket({ server });

server.on("request", app);

const dataSourceURL =
  "https://data.cityofnewyork.us/Public-Safety/NYPD-Arrest-Data-Year-to-Date-/uip8-fykc";
const CSVSourceURL =
  "https://data.cityofnewyork.us/api/views/uip8-fykc/rows.csv?accessType=DOWNLOAD";

const getUpdatedPageData = async (storage) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(dataSourceURL, { waitUntil: "networkidle2" });

  const updatedInfo = await page.evaluate(() =>
    Array.from(
      document.getElementsByClassName("metadata-pair"),
      (item) => item.textContent
    )
  );

  await browser.close();

  if (updatedInfo) {
    if (updatedInfo[0]) {
      const updatedArr = updatedInfo[0].split(/(?=[A-Z])/);

      const latestUpdatedDate = updatedArr[1];

      if (yearlyTotals["lastUpdatedDate"] !== latestUpdatedDate) {
        const updatedYear = dayjs(latestUpdatedDate, "MMMM D, YYYY").format(
          "YYYY"
        );

        const JSONarr = [];

        csv({
          colParser: {
            ARREST_KEY: "omit",
            ARREST_DATE: "string",
            PD_CD: "omit",
            PD_DESC: "string",
            KY_CD: "omit",
            OFNS_DESC: "string",
            LAW_CODE: "omit",
            LAW_CAT_CD: "string",
            ARREST_BORO: "string",
            ARREST_PRECINCT: "omit",
            JURISDICTION_CODE: "omit",
            AGE_GROUP: "string",
            PERP_SEX: "string",
            PERP_RACE: "string",
            X_COORD_CD: "omit",
            Y_COORD_CD: "omit",
            Latitude: (item) => {
              return Number(Number.parseFloat(item).toFixed(6));
            },
            Longitude: (item) => {
              return Number(Number.parseFloat(item).toFixed(6));
            },
            "New Georeferenced Column": "omit",
          },
        })
          .fromStream(request.get(CSVSourceURL))
          .subscribe((json) => JSONarr.push(json))
          .on("done", async () => {
            yearlyTotals["lastUpdatedDate"] = latestUpdatedDate;
            yearlyTotals[updatedYear] = JSONarr.length;

            // Updates server yearly totals object
            fs.writeFileSync(
              "YearlyTotalsNode.js",
              "module.exports = " + JSON.stringify(yearlyTotals),
              "utf-8"
            );

            // Updates client yearly totals object
            fs.writeFileSync(
              "./Client/src/YearlyTotals.js",
              "const yearlyTotals = " +
                JSON.stringify(yearlyTotals) +
                "\n\nexport default yearlyTotals;",
              "utf-8"
            );

            const uploadFileToGoogleCloudStorage = async () => {
              await storage
                .bucket(`${updatedYear}_nypd_arrest_data`)
                .upload(`${updatedYear}.json`, {
                  gzip: true,
                  metadata: {
                    cacheControl: "public, max-age=31536000",
                  },
                });

              try {
                // Remove Local JSON File
                fs.unlinkSync(`${updatedYear}.json`);

                // Push new data from NYC Open Data to github
                require("simple-git")()
                  .add("./*")
                  .commit(
                    `Updated local server and client yearly totals files with ${latestUpdatedDate} data`
                  )
                  .addRemote(
                    "origin",
                    `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/amamenko/nypd-arrest-map.git`
                  )
                  .push(["-u", "origin", "master"])
                  .push(["heroku", "master"]);
              } catch (err) {
                console.error(err);
              }
            };

            // Creates temporary local JSON object containing new values
            fs.writeFileSync(`${updatedYear}.json`, JSON.stringify(JSONarr));

            try {
              // Bucket exists
              const [files] = await storage
                .bucket(`${updatedYear}_nypd_arrest_data`)
                .getFiles();

              if (files) {
                uploadFileToGoogleCloudStorage();
              }
            } catch {
              // Bucket does not exist
              const [newBucket] = await storage.createBucket(
                `${updatedYear}_nypd_arrest_data`
              );

              if (newBucket) {
                uploadFileToGoogleCloudStorage();
              }
            }
          });
      }
    }
  }
};

// Check for new data from NYC Open Data every day at 11:30 PM
cron.schedule("30 23 * * *", () => {
  getUpdatedPageData(storage);
});

wss.on("connection", (ws) => {
  console.log("Websocket successfully connected");

  ws.on("message", (message) => {
    const decodedMessage = decoder.write(Buffer.from(message));
    console.log(decodedMessage);
    if (decodedMessage && decodedMessage !== ".") {
      if (yearlyTotals[decodedMessage]) {
        const bucket = storage.bucket(`${decodedMessage}_nypd_arrest_data`);

        const stream = bucket.file(`${decodedMessage}.json`).createReadStream();

        let chunkArr = [];
        let totalLength = 0;
        let firstMessage = true;
        let lastMessage = false;

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

              if (totalLength === yearlyTotals[decodedMessage]) {
                if (!lastMessage) {
                  lastMessage = true;
                }
              }

              const stringifiedJSON = JSON.stringify({
                chunkArr,
                firstMessage,
                lastMessage,
              });

              ws.send(stringifiedJSON);
              chunkArr = [];

              if (firstMessage) {
                firstMessage = false;
              }
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
