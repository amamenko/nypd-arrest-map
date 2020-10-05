import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import DeckGL from "@deck.gl/react";
import { StaticMap } from "react-map-gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import "./App.css";
import "./mapbox.css";
import NavigationBar from "./NavigationBar/NavigationBar";
import iNoBounce from "./inobounce";
import BottomInfoPanel from "./BottomInfoPanel/BottomInfoPanel";
import { css } from "@emotion/core";
import GridLoader from "react-spinners/GridLoader";
import { GiHandcuffs } from "react-icons/gi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import yearlyTotals from "./YearlyTotals";
import { useCountUp } from "react-countup";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import socketWorker from "comlink-loader!./socketWorker"; // eslint-disable-line import/no-webpack-loader-syntax

dayjs.extend(customParseFormat);

const App = () => {
  const [mapLoaded, changeMapLoaded] = useState(false);
  const [loadedData, changeLoadedData] = useState("");
  const [tooltipVisible, changeTooltipVisible] = useState(false);
  const [loaderColor, changeLoaderColor] = useState("rgb(93, 188, 210)");
  const [mapError, changeMapError] = useState(false);
  const [layers, changeLayers] = useState([]);
  const [loadedYears, changeLoadedYears] = useState([]);
  const [laddaLoading, changeLaddaLoading] = useState(false);
  const [loadingYears, changeLoadingYears] = useState([]);
  const [fetchProgress, changeFetchProgress] = useState(0);

  const [mapVisible, changeMapVisible] = useState(false);

  // Filters
  const [yearFilter, changeYearFilter] = useState([2020]);
  const [categoryFilter, changeCategoryFilter] = useState([]);
  const [offenseFilter, changeOffenseFilter] = useState([]);
  const [ageFilter, changeAgeFilter] = useState([]);
  const [raceFilter, changeRaceFilter] = useState([]);
  const [sexFilter, changeSexFilter] = useState([]);
  const [boroughFilter, changeBoroughFilter] = useState([]);
  const [currentFilters, changeCurrentFilters] = useState({
    year: [],
    category: [],
    offense: [],
    age: [],
    race: [],
    sex: [],
    borough: [],
  });

  // Browser width on initial opening of app
  const [initialScreenWidth] = useState(window.innerWidth);
  // Current browser width if different from initial browser width
  const [currentScreenWidth, changeCurrentScreenWidth] = useState("");

  let layersRef = useRef([]);
  let loadDataChunks = useRef([{}]);
  let filteredDataChunks = useRef([]);
  let toastId = useRef(null);

  const { countUp, update } = useCountUp({
    start: 0,
    end: loadDataChunks.current[0]["2020"]
      ? Number(
          (
            loadDataChunks.current[0]["2020"]
              .map((x) => x.length)
              .reduce((a, b) => a + b, 0) / yearlyTotals["2020"]
          ).toFixed(1)
        ) * 100
      : 0,
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    if (loadDataChunks.current[0]["2020"]) {
      const newProgress =
        Number(
          (
            loadDataChunks.current[0]["2020"]
              .map((x) => x.length)
              .reduce((a, b) => a + b, 0) / yearlyTotals["2020"]
          ).toFixed(1)
        ) * 100;

      if (newProgress > 60) {
        update(100);
      } else {
        update(newProgress);
      }
    }
  }, [update, countUp]);

  const isSame = (arr1, arr2) =>
    arr1.length === arr2.length &&
    arr1.every((item, i) => {
      return item === arr2[i];
    });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (window.innerWidth !== currentScreenWidth) {
        changeCurrentScreenWidth(window.innerWidth);
      }
    };

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [currentScreenWidth]);

  const override = css`
    display: block;
    margin: 0 auto;
  `;

  const uniqueValues = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  const loadData = loadedData ? loadedData.flat() : [""];

  const filteredData = filteredDataChunks.current.flat();

  const hasNumber = (input) => {
    return /\d/.test(input);
  };

  const ageGroup =
    loadData.length > 0 &&
    loadData.map((x) => x.AGE_GROUP).filter((x) => x !== "AGE_GROUP");
  const raceArr =
    loadData.length > 0 &&
    loadData.map((x) => x.PERP_RACE).filter((x) => x !== "PERP_RACE");
  const boroughArr =
    loadData.length > 0 &&
    loadData
      .map((x) => {
        if (x.ARREST_BORO === "K" && Number(x.Latitude) > 40.73912) {
          return "B";
        } else if (
          x.ARREST_BORO === "M" &&
          Number(x.Longitude) > -73.920961 &&
          Number(x.Latitude) < 40.800709
        ) {
          return "Q";
        } else if (x.ARREST_BORO === "B" && Number(x.Latitude) < 40.697465) {
          return "K";
        } else if (x.ARREST_BORO === "Q" && Number(x.Longitude) < -73.962745) {
          return "M";
        } else if (
          x.ARREST_BORO === "Q" &&
          Number(x.Longitude) < -73.878559 &&
          Number(x.Latitude) > 40.787907
        ) {
          return "B";
        } else {
          return x.ARREST_BORO;
        }
      })
      .filter((x) => x !== "ARREST_BORO");
  const offenseDescriptionArr =
    loadData.length > 0 &&
    loadData.map((x) => x.OFNS_DESC !== "OFNS_DESC" && x.OFNS_DESC);

  const filteredArrestCategory = filteredData
    .map((x) => x.LAW_CAT_CD)
    .filter((x) => x !== "LAW_CAT_CD");
  const filteredAgeGroup = filteredData
    .map((x) => x.AGE_GROUP)
    .filter((x) => x !== "AGE_GROUP");
  const filteredSexArr = filteredData
    .map((x) => x.PERP_SEX)
    .filter((x) => x !== "PERP_SEX");
  const filteredRaceArr = filteredData
    .map((x) => x.PERP_RACE)
    .filter((x) => x !== "PERP_RACE");
  const filteredBoroughArr = filteredData
    .map((x) => {
      if (x.ARREST_BORO === "K" && Number(x.Latitude) > 40.77) {
        return "B";
      } else if (
        x.ARREST_BORO === "M" &&
        Number(x.Longitude) > -73.920961 &&
        Number(x.Latitude) < 40.800709
      ) {
        return "Q";
      } else if (x.ARREST_BORO === "B" && Number(x.Latitude) < 40.697465) {
        return "K";
      } else if (
        (x.ARREST_BORO === "B" &&
          Number(x.Latitude) > 40.796669 &&
          Number(x.Longitude) < -73.932786) ||
        (x.ARREST_BORO === "B" &&
          Number(x.Latitude) < 40.796669 &&
          Number(x.Longitude) < -73.98)
      ) {
        return "M";
      } else if (x.ARREST_BORO === "Q" && Number(x.Longitude) < -73.962745) {
        return "M";
      } else if (
        x.ARREST_BORO === "Q" &&
        Number(x.Longitude) < -73.878559 &&
        Number(x.Latitude) > 40.787907
      ) {
        return "B";
      } else {
        return x.ARREST_BORO;
      }
    })
    .filter((x) => x !== "ARREST_BORO");
  const filteredOffenseDescriptionArr = filteredData.map(
    (x) => x.OFNS_DESC !== "OFNS_DESC" && x.OFNS_DESC
  );

  const filteredUniqueCategory = filteredDataChunks.current.map((item) =>
    item
      .map((x) => x.LAW_CAT_CD)
      .filter((x) => x !== "LAW_CAT_CD")
      .filter(uniqueValues)
  );

  const filteredUniqueDates = filteredDataChunks.current.map((item) =>
    item
      .map((x) => x.ARREST_DATE)
      .filter((x) => x !== "ARREST_DATE")
      .filter(uniqueValues)
  );

  const filteredTimelineAgeGroupData = filteredDataChunks.current.map((item) =>
    item
      .map((x) => {
        return {
          date: x.ARREST_DATE,
          age_group: x.AGE_GROUP,
        };
      })
      .filter((x) => x.date !== "ARREST_DATE" && x.age_group !== "AGE_GROUP")
  );

  const filteredTimelineBoroughData = filteredDataChunks.current.map((item) =>
    item
      .map((x) => {
        return {
          date: x.ARREST_DATE,
          borough: x.ARREST_BORO,
        };
      })
      .filter((x) => x.date !== "ARREST_DATE" && x.borough !== "ARREST_BORO")
  );

  const filteredTimelineCategoryData = filteredDataChunks.current.map((item) =>
    item
      .map((x) => {
        return {
          date: x.ARREST_DATE,
          category:
            x.LAW_CAT_CD === "F"
              ? "Felony"
              : x.LAW_CAT_CD === "M"
              ? "Misdemeanor"
              : "Violation",
        };
      })
      .filter((x) => x.date !== "ARREST_DATE" && x.category !== "LAW_CAT_CD")
  );

  const filteredTimelineSexData = filteredDataChunks.current.map((item) =>
    item
      .map((x) => {
        return {
          date: x.ARREST_DATE,
          sex: x.PERP_SEX === "F" ? "Female" : "Male",
        };
      })
      .filter((x) => x.date !== "ARREST_DATE" && x.sex !== "PERP_SEX")
  );

  const filteredTimelineRaceData = filteredDataChunks.current.map((item) =>
    item
      .map((x) => {
        return {
          date: x.ARREST_DATE,
          race: x.PERP_RACE,
        };
      })
      .filter((x) => x.date !== "ARREST_DATE" && x.race !== "PERP_RACE")
  );

  const filteredAgeGroupData = filteredAgeGroup
    .filter(uniqueValues)
    .sort((a, b) => {
      const first = hasNumber(a)
        ? Number(a.split(a[0] === "<" ? "<" : "-")[a[0] === "<" ? 1 : 0])
        : null;
      const second = hasNumber(b)
        ? Number(b.split(b[0] === "<" ? "<" : "-")[b[0] === "<" ? 1 : 0])
        : null;

      return first - second;
    });
  const filteredRaceUniqueValues = filteredRaceArr.filter(uniqueValues).sort();
  const filteredSexUniqueValues = filteredSexArr.filter(uniqueValues).sort();
  const filteredBoroughUniqueValues = filteredBoroughArr
    .filter(uniqueValues)
    .sort();
  const filteredOffenseDescriptionUniqueValues = filteredOffenseDescriptionArr
    .filter(uniqueValues)
    .sort();

  const ageGroupData = ageGroup.filter(uniqueValues).sort((a, b) => {
    const first = hasNumber(a)
      ? Number(a.split(a[0] === "<" ? "<" : "-")[a[0] === "<" ? 1 : 0])
      : null;
    const second = hasNumber(b)
      ? Number(b.split(b[0] === "<" ? "<" : "-")[b[0] === "<" ? 1 : 0])
      : null;

    return first - second;
  });
  const raceUniqueValues = raceArr.filter(uniqueValues).sort();
  const boroughUniqueValues = boroughArr.filter(uniqueValues).sort();
  const offenseDescriptionUniqueValues = offenseDescriptionArr
    .filter(uniqueValues)
    .sort();

  useEffect(() => {
    if (!mapError) {
      while (loadedData === "") {
        const colorChangeInterval = setInterval(() => {
          if (loaderColor === "rgb(93, 188, 210)") {
            changeLoaderColor("rgb(255, 255, 255)");
          } else if (loaderColor === "rgb(255, 255, 255)") {
            changeLoaderColor("#f9c124");
          } else {
            changeLoaderColor("rgb(93, 188, 210)");
          }
        }, 500);

        return () => {
          clearInterval(colorChangeInterval);
        };
      }
    } else {
      changeLoaderColor("rgb(255, 0, 0)");
    }
  }, [loadedData, loaderColor, mapError]);

  // Used to prevent rubber banding effect on mobile phones
  useEffect(() => {
    iNoBounce.enable();
  }, []);

  const token = process.env.REACT_APP_MAPBOX_TOKEN;

  const renderLayers = useCallback(() => {
    const yearsFiltered = filteredDataChunks.current.map((item) =>
      item
        .map((x) => x.ARREST_DATE)
        .filter((x) => x !== "ARREST_DATE")
        .map((x) => Number(dayjs(x, "MM/DD/YYYY").format("YYYY")))
        .filter(uniqueValues)
    );

    if (layers.length !== filteredDataChunks.length) {
      layersRef.current = filteredDataChunks.current.map(
        (chunk, chunkIndex) => {
          const yearOfChunk = chunk
            .map((x) => x.ARREST_DATE)
            .filter((x) => x !== "ARREST_DATE")
            .map((x) => dayjs(x, "MM/DD/YYYY").format("YYYY"))
            .filter(uniqueValues);

          return new ScatterplotLayer({
            id: `chunk-${chunkIndex}`,
            data: chunk,
            visible: yearsFiltered.flat().includes(Number(yearOfChunk[0])),
            filled: true,
            radiusMinPixels: 3,
            getPosition: (d) => [Number(d.Longitude), Number(d.Latitude)],
            getFillColor: (d) =>
              d.LAW_CAT_CD === "F"
                ? [255, 0, 0]
                : d.LAW_CAT_CD === "M"
                ? [255, 116, 0]
                : [255, 193, 0],
            pickable: true,
            parameters: {
              depthTest: false,
            },
          });
        }
      );

      if (!isSame(layers, layersRef.current)) {
        changeLayers(layersRef.current);
      }
    }
  }, [filteredDataChunks, layers]);

  const onNewDataArrive = useCallback(
    (chunk) => {
      const chunkYear = chunk.year;

      if (!loadDataChunks.current[0][chunkYear]) {
        Object.assign(loadDataChunks.current[0], { [chunkYear]: [chunk.data] });
      } else {
        loadDataChunks.current[0][chunkYear].push(chunk.data);
      }

      const splitChunks = Object.keys(loadDataChunks.current[0]).map(
        (item, i) => {
          return { [item]: loadDataChunks.current[0][item] };
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

      filteredDataChunks.current = loadedDataArr;

      changeLoadedData(loadedDataArr);

      if (layers.length === 0 || layers.length !== loadedDataArr.length) {
        renderLayers();
      }
    },
    [loadDataChunks, renderLayers, layers.length]
  );

  useEffect(() => {
    const currentRef = loadDataChunks.current;
    const selectedYear = loadingYears[0]
      ? loadingYears[0].toString().slice()
      : null;

    if (loadingYears[0]) {
      const progressInterval = setInterval(() => {
        if (currentRef[0][selectedYear.toString()]) {
          const refProgress = (
            currentRef[0][selectedYear.toString()]
              .map((x) => x.length)
              .reduce((a, b) => a + b, 0) /
            yearlyTotals[selectedYear.toString()]
          ).toFixed(1);

          if (fetchProgress !== refProgress) {
            changeFetchProgress(Number(refProgress));
          }
        }

        return () => {
          clearInterval(progressInterval);
        };
      }, 500);
    }
  }, [fetchProgress, loadingYears, loadedData]);

  useEffect(() => {
    if (fetchProgress < 1 && toastId.current) {
      console.log(fetchProgress);
      toast.update(toastId.current, {
        progress: fetchProgress,
      });
    } else if (fetchProgress === 1) {
      if (loadedYears.length === 1 && loadedYears[0] === 2020) {
        toast.dismiss();
      } else {
        toast.update(toastId.current, {
          render: `Data for ${loadingYears[0]} successfully loaded`,
          type: toast.TYPE.SUCCESS,
          autoClose: false,
          progress: 1.0,
          closeButton: true,
        });

        const dismissTimer = setTimeout(() => {
          toast.dismiss();
        }, 5000);

        return () => {
          clearTimeout(dismissTimer);
        };
      }
    }
  }, [fetchProgress, loadingYears, loadedYears]);

  useEffect(() => {
    if (loadingYears.length > 0) {
      const selectedYear = loadingYears[0];

      if (
        !toastId.current &&
        typeof loadedData === "object" &&
        loadedData.flat().length > 70000 &&
        selectedYear !== 2020
      ) {
        toastId.current = toast.info(`Loading ${selectedYear} data`, {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          progress: 0,
        });
      }
    }
  }, [loadingYears, loadedData, fetchProgress, loadedYears.length]);

  const splitChunks = Object.keys(loadDataChunks.current[0]).map((item, i) => {
    return { [item]: loadDataChunks.current[0][item] };
  });

  const loadedDataArr = splitChunks.map((x, i) => {
    const keyName = Object.keys(loadDataChunks.current[0])[i];

    let flattenedArray = [];

    if (x[keyName]) {
      for (let i = 0; i < x[keyName].length; i++) {
        let currentValue = x[keyName][i];
        for (let j = 0; j < currentValue.length; j++) {
          flattenedArray.push(currentValue[j]);
        }
      }
    }
    return flattenedArray;
  });

  const dataFetch = useCallback(
    async (year) => {
      const workerInstance = new socketWorker();

      if (!loadedYears.includes(2020)) {
        if (!loadingYears.includes(year)) {
          changeLoadingYears([year]);

          const refProgress = loadDataChunks.current[0][year.toString()]
            ? loadDataChunks.current[0][year.toString()]
                .map((x) => x.length)
                .reduce((a, b) => a + b, 0) /
              yearlyTotals[year.toString()].toFixed(1)
            : 0;

          setInterval(() => {
            let currentIndex = 0;

            let runSocket = true;

            if (runSocket) {
              runSocket = false;
              currentIndex++;

              workerInstance.getSocketData(year, currentIndex).then((data) => {
                if (data) {
                  onNewDataArrive({ year: year, data: JSON.parse(data) });

                  if (!loadedYears.includes(year)) {
                    changeLoadedYears([...loadedYears, year]);
                  }

                  if (refProgress === 1) {
                    changeFetchProgress(0);
                    if (loadedYears.includes(year)) {
                      changeLoadedYears([...loadedYears, year]);
                    }
                    if (loadingYears.length > 0) {
                      changeLoadingYears([]);
                    }
                    if (laddaLoading) {
                      changeLaddaLoading(false);
                    }
                  } else {
                    runSocket = true;
                  }
                }
              });
            }
          }, 5000);
        }
      } else {
        workerInstance.getSocketData(year).then((data) => {
          if (data) {
            onNewDataArrive({ year: year, data: JSON.parse(data) });

            if (!loadedYears.includes(year)) {
              changeLoadedYears([...loadedYears, year]);
            }

            if (fetchProgress === 1) {
              changeFetchProgress(0);
              if (!loadedYears.includes(year)) {
                changeLoadedYears([...loadedYears, year]);
              }
              if (loadingYears.length > 0) {
                changeLoadingYears([]);
              }
              if (laddaLoading) {
                changeLaddaLoading(false);
              }
            }
          }
        });
      }
    },
    [loadedYears, onNewDataArrive, laddaLoading, fetchProgress, loadingYears]
  );

  const handleDownloadYear = (year) => {
    changeLoadingYears([year]);
  };

  const setFilters = (year, category, offense, age, race, sex, borough) => {
    const newYears = year.filter((item) => !loadedYears.includes(item));

    changeCurrentFilters({
      year: year,
      category: category,
      offense: offense,
      age: age,
      race: race,
      sex: sex,
      borough: borough,
    });

    filteredDataChunks.current = loadedDataArr.map((chunk) => {
      return chunk.filter((x) => {
        if (
          (year.includes(
            Number(dayjs(x.ARREST_DATE, "MM/DD/YYYY").format("YYYY"))
          ) ||
            year.length === 0) &&
          (category.includes(x.LAW_CAT_CD) || category.length === 0) &&
          (offense.includes(x.OFNS_DESC) || offense.length === 0) &&
          (age.includes(x.AGE_GROUP) || age.length === 0) &&
          (race.includes(x.PERP_RACE) || race.length === 0) &&
          (sex.includes(x.PERP_SEX) || sex.length === 0) &&
          (race.includes(x.PERP_RACE) || race.length === 0) &&
          (borough.includes(
            x.ARREST_BORO === "K" && Number(x.Latitude) > 40.77
              ? "B"
              : x.ARREST_BORO === "M" &&
                Number(x.Longitude) > -73.920961 &&
                Number(x.Latitude) < 40.800709
              ? "Q"
              : x.ARREST_BORO === "B" && Number(x.Latitude) < 40.697465
              ? "K"
              : (x.ARREST_BORO === "B" &&
                  Number(x.Latitude) > 40.796669 &&
                  Number(x.Longitude) < -73.932786) ||
                (x.ARREST_BORO === "B" &&
                  Number(x.Latitude) < 40.796669 &&
                  Number(x.Longitude) < -73.98)
              ? "M"
              : x.ARREST_BORO === "Q" && Number(x.Longitude) < -73.962745
              ? "M"
              : x.ARREST_BORO === "Q" &&
                Number(x.Longitude) < -73.878559 &&
                Number(x.Latitude) > 40.787907
              ? "B"
              : x.ARREST_BORO
          ) ||
            borough.length === 0)
        ) {
          return true;
        } else {
          return false;
        }
      });
    });

    if (!newYears.length > 0) {
      setTimeout(() => changeLaddaLoading(false), 2000);
    }

    renderLayers();
  };

  useEffect(() => {
    if (!loadedYears.includes(2020)) {
      dataFetch(2020);
    } else if (
      loadingYears.length > 0 &&
      !loadDataChunks.current[0][loadingYears[0]]
    ) {
      dataFetch(loadingYears[0]);
    }
  }, [loadedData, loadedYears, dataFetch, loadingYears]);

  const showTooltip = (object, x, y) => {
    const el = document.getElementsByClassName("deck-tooltip")[0];

    if (object) {
      if (!tooltipVisible) {
        changeTooltipVisible(true);
      }

      const {
        ARREST_DATE,
        LAW_CAT_CD,
        OFNS_DESC,
        PD_DESC,
        AGE_GROUP,
        PERP_SEX,
        PERP_RACE,
      } = object;
      el.innerHTML = `
      <p><strong>Date of Arrest:</strong> ${ARREST_DATE}</p>
      <p><strong>Category:</strong> ${
        LAW_CAT_CD === "F"
          ? "Felony"
          : LAW_CAT_CD === "M"
          ? "Misdemeanor"
          : "Violation"
      }</p>
      <p><strong>Offense:</strong> ${OFNS_DESC}</p>
      <p><strong>Offense Description:</strong> ${PD_DESC}</p>
      <p><strong>Perpetrator's Age Group:</strong> ${AGE_GROUP}</p>
      <p><strong>Perpetrator's Sex:</strong> ${
        PERP_SEX === "M" ? "Male" : "Female"
      }</p>
      <p><strong>Perpetrator's Race:</strong> ${PERP_RACE.toLowerCase()
        .split(" ")
        .map((x) => x[0].toUpperCase() + x.slice(1))
        .join(" ")}</p>
  `;
      el.style.display = "inline-block";
      el.style.background = "#000";
      el.style.color = "rgb(235, 235, 235)";
      el.style.fontSize = "1rem";
      el.style.overflowWrap = "break-word";
      el.style.lineHeight = "1rem";
      el.style.maxWidth = "10rem";
      el.style.opacity = 0.9;
      el.style.left = x + "px";
      el.style.top = y + "px";
    } else {
      if (tooltipVisible) {
        changeTooltipVisible(false);
      }
      el.style.opacity = 0;
    }
  };

  useEffect(() => {
    if (typeof loadedData === "object" && loadedData.flat().length > 70000) {
      const mapVisibleDelay = setTimeout(() => changeMapVisible(true), 3000);

      return () => {
        clearTimeout(mapVisibleDelay);
      };
    }
  }, [loadedData]);

  return (
    <>
      <div
        className="loading_container"
        style={{
          display:
            loadedData === "" ||
            (typeof loadedData === "object" && loadedData.flat().length < 70000)
              ? "flex"
              : "none",
        }}
      >
        {fetchProgress === 0 ? (
          <GridLoader
            css={override}
            size={50}
            color={loaderColor}
            style={{ transition: "all 0.5s ease" }}
            loading={
              loadedData === "" ||
              (typeof loadedData === "object" &&
                loadedData.flat().length < 70000)
            }
          />
        ) : (
          <CircularProgressbarWithChildren
            value={countUp}
            styles={buildStyles({
              strokeLinecap: "butt",
              trailColor: "#eee",
            })}
          >
            <GiHandcuffs color="#fff" size="4rem" />
            <div style={{ fontSize: 30, marginTop: 20, color: "#fff" }}>
              <strong>{countUp}%</strong>
            </div>
          </CircularProgressbarWithChildren>
        )}
        <p>
          {mapError
            ? "Error Initializing NYPD Arrest Map"
            : fetchProgress === 0
            ? "Initializing NYPD Arrest Map"
            : "Loading Most Recent Arrest Data"}
        </p>
      </div>
      <div
        className="nypd_arrest_map_container"
        style={{
          opacity:
            loadedData === "" ||
            (typeof loadedData === "object" && loadedData.flat().length < 70000)
              ? 0
              : 1,
        }}
      >
        <ToastContainer
          position="bottom-center"
          autoClose={false}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
        />
        <NavigationBar
          loadData={loadedData ? loadedData.flat() : [""]}
          raceUniqueValues={raceUniqueValues}
          boroughUniqueValues={boroughUniqueValues}
          offenseDescriptionUniqueValues={offenseDescriptionUniqueValues}
          ageGroupData={ageGroupData}
          setFilters={setFilters}
          initialScreenWidth={initialScreenWidth}
          currentScreenWidth={currentScreenWidth}
          loadedYears={loadedYears}
          pointClicked={tooltipVisible}
          changeLaddaLoading={changeLaddaLoading}
          laddaLoading={laddaLoading}
          filteredData={filteredDataChunks.current}
          handleDownloadYear={handleDownloadYear}
          yearFilter={yearFilter}
          changeYearFilter={changeYearFilter}
          categoryFilter={categoryFilter}
          changeCategoryFilter={changeCategoryFilter}
          offenseFilter={offenseFilter}
          changeOffenseFilter={changeOffenseFilter}
          ageFilter={ageFilter}
          changeAgeFilter={changeAgeFilter}
          raceFilter={raceFilter}
          changeRaceFilter={changeRaceFilter}
          sexFilter={sexFilter}
          changeSexFilter={changeSexFilter}
          boroughFilter={boroughFilter}
          changeBoroughFilter={changeBoroughFilter}
        />
        <DeckGL
          initialViewState={{
            longitude: -73.935242,
            latitude: 40.73061,
            zoom: window.innerWidth < 1200 ? 9 : 11,
            minZoom: 9,
            pitch: 0,
            bearing: 0,
          }}
          controller={true}
          layers={layersRef.current}
          onHover={({ object, x, y }) => showTooltip(object, x, y)}
          onClick={({ object, x, y }) => showTooltip(object, x, y)}
          pickingRadius={10}
          onLoad={() => changeMapLoaded(true)}
          onError={(e) => changeMapError(true)}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxApiAccessToken={token}
          />
        </DeckGL>
        {mapLoaded ? (
          <BottomInfoPanel
            isSame={isSame}
            mapVisible={mapVisible}
            loadData={loadData}
            loadDataChunks={loadDataChunks.current}
            tooltipVisible={tooltipVisible}
            filteredArrestCategory={filteredArrestCategory}
            filteredAgeGroupData={filteredAgeGroupData}
            filteredRaceUniqueValues={filteredRaceUniqueValues}
            filteredSexUniqueValues={filteredSexUniqueValues}
            filteredBoroughUniqueValues={filteredBoroughUniqueValues}
            filteredOffenseDescriptionUniqueValues={
              filteredOffenseDescriptionUniqueValues
            }
            filteredUniqueCategory={filteredUniqueCategory}
            filteredAgeGroup={filteredAgeGroup}
            filteredRaceArr={filteredRaceArr}
            filteredSexArr={filteredSexArr}
            filteredBoroughArr={filteredBoroughArr}
            filteredOffenseDescriptionArr={filteredOffenseDescriptionArr}
            loadedYears={loadedYears}
            currentFilters={currentFilters}
            filteredUniqueDates={filteredUniqueDates}
            filteredTimelineAgeGroupData={filteredTimelineAgeGroupData}
            filteredTimelineBoroughData={filteredTimelineBoroughData}
            filteredTimelineCategoryData={filteredTimelineCategoryData}
            filteredTimelineSexData={filteredTimelineSexData}
            filteredTimelineRaceData={filteredTimelineRaceData}
            uniqueValues={uniqueValues}
          />
        ) : null}
      </div>
    </>
  );
};

export default App;
