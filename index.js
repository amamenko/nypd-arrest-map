const express = require("express");
const app = express();
const WebSocket = require("ws").Server;
const server = require("http").createServer();
const { Storage } = require("@google-cloud/storage");
const compression = require("compression");
const oboe = require("oboe");
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
const axios = require("axios");
const contentful = require("contentful-management");

require("dotenv").config();

const port = process.env.PORT || 4000;

// compress responses
app.use(compression());

const cors = require("cors");

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://nypd-arrest-map.onrender.com"
      : "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
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
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-sandbox",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(dataSourceURL, { waitUntil: "networkidle2" });

  const updatedInfo = await page.evaluate(() =>
    Array.from(
      document.getElementsByClassName("metadata-pair"),
      (item) => item.textContent
    )
  );

  await browser.close();

  console.log(updatedInfo);

  if (updatedInfo) {
    if (updatedInfo[0]) {
      const updatedArr = updatedInfo[0].split(/(?=[A-Z])/);

      const latestUpdatedDate = updatedArr[1];

      console.log(latestUpdatedDate);

      const arrestQuery = `
        query {
          arrestCollection {
            items {
              arrestData  
            }
          }
        }
      `;

      axios({
        url: `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        data: {
          query: arrestQuery,
        },
      })
        .then((res) => res.data)
        .then(async ({ data, errors }) => {
          if (errors) {
            console.error(errors);
          }

          if (data) {
            if (data.arrestCollection) {
              if (data.arrestCollection.items) {
                if (data.arrestCollection.items[0]) {
                  if (data.arrestCollection.items[0].arrestData) {
                    const yearlyTotals =
                      data.arrestCollection.items[0].arrestData;

                    if (yearlyTotals["lastUpdatedDate"] !== latestUpdatedDate) {
                      const updatedYear = dayjs(
                        latestUpdatedDate,
                        "MMMM D, YYYY"
                      ).format("YYYY");

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

                          const uploadFileToGoogleCloudStorage = async () => {
                            await storage
                              .bucket(`${updatedYear}-nypd-arrest-data`)
                              .upload(`${updatedYear}.json`, {
                                gzip: true,
                                metadata: {
                                  cacheControl: "public, max-age=31536000",
                                },
                              });

                            console.log(
                              `Uploaded ${updatedYear}.json to Google Cloud Storage!`
                            );

                            // Remove Local JSON File
                            fs.unlinkSync(`${updatedYear}.json`);

                            const contentfulClient = contentful.createClient({
                              accessToken:
                                process.env.CONTENTFUL_MANAGEMENT_TOKEN,
                            });

                            contentfulClient
                              .getSpace(process.env.CONTENTFUL_SPACE_ID)
                              .then((space) => {
                                space
                                  .getEnvironment("master")
                                  .then((environment) => {
                                    environment
                                      .getEntry(process.env.CONTENTFUL_ENTRY_ID)
                                      .then((entry) => {
                                        entry.fields.arrestData = {
                                          "en-US": yearlyTotals,
                                        };

                                        entry.update().then(() => {
                                          environment
                                            .getEntry(
                                              process.env.CONTENTFUL_ENTRY_ID
                                            )
                                            .then((updatedEntry) => {
                                              updatedEntry.publish();

                                              console.log(
                                                "Yearly totals list updated successfully and published on Contentful."
                                              );
                                            });
                                        });
                                      });
                                  });
                              });
                          };

                          // Creates temporary local JSON object containing new values
                          fs.writeFileSync(
                            `${updatedYear}.json`,
                            JSON.stringify(JSONarr)
                          );

                          try {
                            // Bucket exists
                            const [files] = await storage
                              .bucket(`${updatedYear}-nypd-arrest-data`)
                              .getFiles();

                            if (files) {
                              uploadFileToGoogleCloudStorage();
                            }
                          } catch {
                            // Bucket does not exist
                            const [newBucket] = await storage.createBucket(
                              `${updatedYear}-nypd-arrest-data`
                            );

                            if (newBucket) {
                              uploadFileToGoogleCloudStorage();
                            }
                          }
                        });
                    }
                  }
                }
              }
            }
          }
        });
    }
  }
};

// Check for new data from NYC Open Data every day at 10:30 PM
cron.schedule("30 22 * * *", () => {
  getUpdatedPageData(storage);
});

wss.on("connection", (ws) => {
  console.log("Websocket successfully connected");

  ws.on("message", (message) => {
    const decodedMessage = decoder.write(Buffer.from(message));
    console.log(decodedMessage);
    if (decodedMessage && decodedMessage !== ".") {
      const arrestQuery = `
        query {
          arrestCollection {
            items {
              arrestData  
            }
          }
        }
      `;

      axios({
        url: `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        data: {
          query: arrestQuery,
        },
      })
        .then((res) => res.data)
        .then(async ({ data, errors }) => {
          if (errors) {
            console.error(errors);
          }

          if (data) {
            if (data.arrestCollection) {
              if (data.arrestCollection.items) {
                if (data.arrestCollection.items[0]) {
                  if (data.arrestCollection.items[0].arrestData) {
                    const yearlyTotals =
                      data.arrestCollection.items[0].arrestData;

                    if (yearlyTotals[decodedMessage]) {
                      const bucket = storage.bucket(
                        `${decodedMessage}-nypd-arrest-data`
                      );

                      const stream = bucket
                        .file(`${decodedMessage}.json`)
                        .createReadStream();

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
                }
              }
            }
          }
        });
    }
  });

  ws.on("close", () => console.log("WebSocket closed"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("Client/build"));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "build", "index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.redirect("/");
  });
}

app.get("/health", (req, res) => {
  res.send("The NYPD arrest map is up and running!");
});

server.listen(port, () => console.log("Listening to port " + port));
