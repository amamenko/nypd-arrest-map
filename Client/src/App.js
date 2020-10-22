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
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import yearlyTotals from "./YearlyTotals";
import { useCountUp } from "react-countup";
import InitialLoader from "./InitialLoader";
import SubsequentLoader from "./SubsequentLoader";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import ACTION_LOAD_DATA_CHUNKS_ADD_TO_YEAR from "./actions/loadDataChunks/ACTION_LOAD_DATA_CHUNKS_ADD_TO_YEAR";
import ACTION_LOAD_DATA_CHUNKS_ADD_YEAR from "./actions/loadDataChunks/ACTION_LOAD_DATA_CHUNKS_ADD_YEAR";
import ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR from "./actions/filteredDataChunks/ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR";
import ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR from "./actions/filteredDataChunks/ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR";
import ACTION_ASSIGN_FILTERED_DATA_CHUNKS from "./actions/filteredDataChunks/ACTION_ASSIGN_FILTERED_DATA_CHUNKS";
import ACTION_INCREMENT_TOTAL_COUNT from "./actions/totalCount/ACTION_INCREMENT_TOTAL_COUNT";
import ACTION_ASSIGN_FILTERED_DATA from "./actions/filteredData/ACTION_ASSIGN_FILTERED_DATA";
import ACTION_FILTERED_DATA_CHANGED from "./actions/filteredData/ACTION_FILTERED_DATA_CHANGED";
import ACTION_FILTERED_DATA_CHANGED_RESET from "./actions/filteredData/ACTION_FILTERED_DATA_CHANGED_RESET";
import ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA from "./actions/timelineGraphData/ageGroup/ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA";
import ACTION_TIMELINE_BOROUGH_GRAPH_DATA from "./actions/timelineGraphData/borough/ACTION_TIMELINE_BOROUGH_GRAPH_DATA";
import ACTION_TIMELINE_CATEGORY_GRAPH_DATA from "./actions/timelineGraphData/category/ACTION_TIMELINE_CATEGORY_GRAPH_DATA";
import ACTION_TIMELINE_GENDER_GRAPH_DATA from "./actions/timelineGraphData/gender/ACTION_TIMELINE_GENDER_GRAPH_DATA";
import ACTION_TIMELINE_RACE_GRAPH_DATA from "./actions/timelineGraphData/race/ACTION_TIMELINE_RACE_GRAPH_DATA";
import timelineGraphWorker from "worker-loader!./timelineGraphWorker.js"; // eslint-disable-line import/no-webpack-loader-syntax

dayjs.extend(customParseFormat);

const App = () => {
  const dispatch = useDispatch();

  const filteredData = useSelector((state) => state.filteredDataReducer.data);
  const filteredDataChanged = useSelector(
    (state) => state.filteredDataReducer.changed
  );
  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );
  const loadDataChunks = useSelector(
    (state) => state.loadDataChunksReducer.data
  );
  const totalCount = useSelector((state) => state.totalCountReducer.total);

  const ageGroupTimelineGraphData = useSelector(
    (state) => state.ageGroupTimelineGraphDataReducer.data
  );
  // const boroughTimelineGraphData = useSelector(
  //   (state) => state.boroughTimelineGraphDataReducer.data
  // );
  // const categoryTimelineGraphData = useSelector(
  //   (state) => state.categoryTimelineGraphDataReducer.data
  // );
  // const genderTimelineGraphData = useSelector(
  //   (state) => state.genderTimelineGraphDataReducer.data
  // );
  // const raceTimelineGraphData = useSelector(
  //   (state) => state.raceTimelineGraphDataReducer.data
  // );

  const [mapLoaded, changeMapLoaded] = useState(false);
  const [tooltipVisible, changeTooltipVisible] = useState(false);
  const [loaderColor, changeLoaderColor] = useState("rgb(93, 188, 210)");
  const [mapError, changeMapError] = useState(false);
  const [modalActive, changeModalActive] = useState({
    active: false,
    year: null,
  });

  // Filters
  const [categoryFilter, changeCategoryFilter] = useState([]);
  const [offenseFilter, changeOffenseFilter] = useState([]);
  const [ageFilter, changeAgeFilter] = useState([]);
  const [raceFilter, changeRaceFilter] = useState([]);
  const [sexFilter, changeSexFilter] = useState([]);
  const [boroughFilter, changeBoroughFilter] = useState([]);
  const [yearFilter, changeYearFilter] = useState([2020]);

  const [laddaLoading, changeLaddaLoading] = useState(false);
  const [loadingYears, changeLoadingYears] = useState([]);
  const [fetchProgress, changeFetchProgress] = useState(0);
  const [loadData, changeLoadData] = useState([]);

  // Web Worker Instances
  const [workerInstance, changeWorkerInstance] = useState("");
  const [mapFilterWorkerInstance, changeMapFilterWorkerInstance] = useState("");
  const [filterWorkerInstance, changeFilterWorkerInstance] = useState("");
  const [timelineWorkerInstance, changeTimelineWorkerInstance] = useState("");
  const [
    timelineGraphWorkerInstance,
    changeTimelineGraphWorkerInstance,
  ] = useState("");

  const [mapVisible, changeMapVisible] = useState(false);

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
  let progressVal = useRef("");

  // Needed for screen-readers
  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  // Custom Hook to check for previous state
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevFilters = usePrevious(currentFilters);

  const loadedYears = Object.keys(loadDataChunks[0]).map((x) => Number(x));

  const { countUp, update } = useCountUp({
    start: 0,
    end: loadDataChunks[0]["2020"]
      ? Number(
          (
            loadDataChunks[0]["2020"]
              .map((x) => x.length)
              .reduce((a, b) => a + b, 0) / yearlyTotals["2020"]
          ).toFixed(1)
        ) * 100
      : 0,
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    if (loadDataChunks[0]["2020"]) {
      const newProgress =
        Number(
          (
            loadDataChunks[0]["2020"]
              .map((x) => x.length)
              .reduce((a, b) => a + b, 0) / yearlyTotals["2020"]
          ).toFixed(1)
        ) * 100;

      if (newProgress >= 60) {
        update(100);
      } else {
        update(newProgress);
      }
    }
  }, [update, countUp, loadDataChunks]);

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

  const prevLoadChunks = usePrevious(loadDataChunks);

  useEffect(() => {
    if (loadDataChunks !== prevLoadChunks) {
      if (Object.values(loadDataChunks[0])[0]) {
        changeLoadData(Object.values(loadDataChunks[0])[0].flat());
      }
    }
  }, [loadDataChunks, prevLoadChunks]);

  const [ageGroup, changeAgeGroup] = useState([]);
  const [raceArr, changeRaceArr] = useState([]);
  const [boroughArr, changeBoroughArr] = useState([]);
  const [offenseDescriptionArr, changeOffenseDescriptionArr] = useState([]);
  const [filteredArrestCategory, changeFilteredArrestCategory] = useState([]);
  const [filteredAgeGroup, changeFilteredAgeGroup] = useState([]);
  const [filteredSexArr, changeFilteredSexArr] = useState([]);
  const [filteredRaceArr, changeFilteredRaceArr] = useState([]);
  const [filteredBoroughArr, changeFilteredBoroughArr] = useState([]);
  const [
    filteredOffenseDescriptionArr,
    changeFilteredOffenseDescriptionArr,
  ] = useState([]);
  const [filteredUniqueCategory, changeFilteredUniqueCategory] = useState([]);
  const [filteredUniqueDates, changeFilteredUniqueDates] = useState([]);
  const [
    filteredTimelineAgeGroupData,
    changeFilteredTimelineAgeGroupData,
  ] = useState([]);
  const [
    filteredTimelineBoroughData,
    changeFilteredTimelineBoroughData,
  ] = useState([]);
  const [
    filteredTimelineCategoryData,
    changeFilteredTimelineCategoryData,
  ] = useState([]);
  const [filteredTimelineSexData, changeFilteredTimelineSexData] = useState([]);
  const [filteredTimelineRaceData, changeFilteredTimelineRaceData] = useState(
    []
  );

  const postToTimelineGraphWorker = useCallback(
    (arrName, generalName, arr, unique, dataArr) => {
      if (timelineGraphWorkerInstance) {
        // Send from main thread to web worker
        timelineGraphWorkerInstance.postMessage({
          arrName: arrName,
          generalName: generalName,
          arr: arr,
          unique: unique,
          dataArr: dataArr,
        });

        timelineGraphWorkerInstance.onmessage = (receivedData) => {
          console.log(receivedData.data);
          const arrayName = receivedData.data.arrayName;

          const returnedArr = receivedData.data.returnedArr;

          if (arrayName === "ageGroupTimelineGraphData") {
            dispatch(ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA(returnedArr));
          } else if (arrayName === "boroughTimelineGraphData") {
            dispatch(ACTION_TIMELINE_BOROUGH_GRAPH_DATA(returnedArr));
          } else if (arrayName === "categoryTimelineGraphData") {
            dispatch(ACTION_TIMELINE_CATEGORY_GRAPH_DATA(returnedArr));
          } else if (arrayName === "genderTimelineGraphData") {
            dispatch(ACTION_TIMELINE_GENDER_GRAPH_DATA(returnedArr));
          } else {
            dispatch(ACTION_TIMELINE_RACE_GRAPH_DATA(returnedArr));
          }
        };
      }
    },
    [timelineGraphWorkerInstance, dispatch]
  );

  const postToFilteredWorker = useCallback(
    (arrName, arr) => {
      if (filterWorkerInstance) {
        // Send from main thread to web worker
        filterWorkerInstance.postMessage({ arrName: arrName, arr: arr });

        filterWorkerInstance.onmessage = (receivedData) => {
          const parsedData = JSON.parse(receivedData.data);

          console.log(parsedData);

          const arrayName = parsedData.arrayName;
          const returnedArr = parsedData.returnedArr;

          if (arrayName === "filteredAgeGroupData") {
            postToTimelineGraphWorker(
              "ageGroupTimelineGraphData",
              "age_group",
              filteredUniqueDates,
              returnedArr,
              filteredTimelineAgeGroupData
            );

            changeFilteredAgeGroupData(returnedArr);
          } else if (arrayName === "filteredRaceUniqueValues") {
            postToTimelineGraphWorker(
              "raceTimelineGraphData",
              "race",
              filteredUniqueDates,
              returnedArr,
              filteredTimelineRaceData
            );

            changeFilteredRaceUniqueValues(returnedArr);
          } else if (arrayName === "filteredSexUniqueValues") {
            postToTimelineGraphWorker(
              "genderTimelineGraphData",
              "sex",
              filteredUniqueDates,
              returnedArr,
              filteredTimelineSexData
            );

            changeFilteredSexUniqueValues(returnedArr);
          } else if (arrayName === "filteredBoroughUniqueValues") {
            postToTimelineGraphWorker(
              "boroughTimelineGraphData",
              "borough",
              filteredUniqueDates,
              returnedArr,
              filteredTimelineBoroughData
            );

            changeFilteredBoroughUniqueValues(returnedArr);
          } else if (arrayName === "filteredOffenseDescriptionUniqueValues") {
            changeFilteredOffenseDescriptionUniqueValues(returnedArr);
          } else if (arrayName === "ageGroupData") {
            changeAgeGroupData(returnedArr);
          } else if (arrayName === "raceUniqueValues") {
            changeRaceUniqueValues(returnedArr);
          } else if (arrayName === "boroughUniqueValues") {
            changeBoroughUniqueValues(returnedArr);
          } else {
            changeOffenseDescriptionUniqueValues(returnedArr);
          }
        };
      }
    },
    [
      filterWorkerInstance,
      filteredTimelineAgeGroupData,
      filteredTimelineBoroughData,
      filteredTimelineRaceData,
      filteredTimelineSexData,
      filteredUniqueDates,
      postToTimelineGraphWorker,
    ]
  );

  const postToMapFilterWorker = useCallback(
    (chunk, arrName, specificName) => {
      if (mapFilterWorkerInstance) {
        // Send from main thread to web worker
        mapFilterWorkerInstance.postMessage({
          chunk: chunk,
          arrName: arrName,
          filterExactName: specificName,
        });

        mapFilterWorkerInstance.onmessage = (receivedData) => {
          const parsedData = JSON.parse(receivedData.data);

          console.log(parsedData);

          const arrayName = parsedData.arrayName;
          const returnedArr = parsedData.returnedArr;

          if (arrayName === "ageGroup") {
            changeAgeGroup(returnedArr);

            postToFilteredWorker("ageGroupData", returnedArr);
          } else if (arrayName === "raceArr") {
            changeRaceArr(returnedArr);

            postToFilteredWorker("raceUniqueValues", returnedArr);
          } else if (arrayName === "boroughArr") {
            changeBoroughArr(returnedArr);

            postToFilteredWorker("boroughUniqueValues", returnedArr);
          } else if (arrayName === "offenseDescriptionArr") {
            changeOffenseDescriptionArr(returnedArr);

            postToFilteredWorker("offenseDescriptionUniqueValues", returnedArr);
          } else if (arrayName === "filteredArrestCategory") {
            changeFilteredArrestCategory(returnedArr);
          } else if (arrayName === "filteredAgeGroup") {
            changeFilteredAgeGroup(returnedArr);

            postToFilteredWorker("filteredAgeGroupData", returnedArr);
          } else if (arrayName === "filteredSexArr") {
            changeFilteredSexArr(returnedArr);

            postToFilteredWorker("filteredSexUniqueValues", returnedArr);
          } else if (arrayName === "filteredRaceArr") {
            changeFilteredRaceArr(returnedArr);

            postToFilteredWorker("filteredRaceUniqueValues", returnedArr);
          } else if (arrayName === "filteredBoroughArr") {
            changeFilteredBoroughArr(returnedArr);

            postToFilteredWorker("filteredBoroughUniqueValues", returnedArr);
          } else if (arrayName === "filteredOffenseDescriptionArr") {
            changeFilteredOffenseDescriptionArr(returnedArr);

            postToFilteredWorker(
              "filteredOffenseDescriptionUniqueValues",
              returnedArr
            );
          } else if (arrayName === "filteredUniqueCategory") {
            changeFilteredUniqueCategory(returnedArr);

            postToTimelineGraphWorker(
              "categoryTimelineGraphData",
              "category",
              filteredUniqueDates,
              returnedArr,
              filteredTimelineCategoryData
            );
          } else {
            changeFilteredUniqueDates(returnedArr);
          }
        };
      }
    },
    [
      mapFilterWorkerInstance,
      filteredTimelineCategoryData,
      filteredUniqueDates,
      postToTimelineGraphWorker,
      postToFilteredWorker,
    ]
  );

  const prevLoadData = usePrevious(loadData);

  useEffect(() => {
    if (loadData && loadData.length > 0 && prevLoadData) {
      if (loadData[0] !== prevLoadData[0]) {
        postToMapFilterWorker(loadData, "ageGroup", "AGE_GROUP");
        postToMapFilterWorker(loadData, "raceArr", "PERP_RACE");
        postToMapFilterWorker(loadData, "boroughArr", "ARREST_BORO");
        postToMapFilterWorker(loadData, "offenseDescriptionArr", "OFNS_DESC");
      }
    }
  }, [loadData, postToMapFilterWorker, prevLoadData]);

  const postToTimelineWorker = useCallback(
    (chunk, generalName, specificName) => {
      if (timelineWorkerInstance) {
        // Send from main thread to web worker
        timelineWorkerInstance.postMessage({
          chunk: chunk,
          filterGeneralName: generalName,
          filterExactName: specificName,
        });

        timelineWorkerInstance.onmessage = (receivedData) => {
          const parsedData = JSON.parse(receivedData.data);

          console.log(parsedData);

          const arrayName = parsedData.arrayName;
          const returnedArr = parsedData.returnedArr;

          if (arrayName === "age_group") {
            changeFilteredTimelineAgeGroupData(returnedArr);
          } else if (arrayName === "borough") {
            changeFilteredTimelineBoroughData(returnedArr);
          } else if (arrayName === "category") {
            changeFilteredTimelineCategoryData(returnedArr);
          } else if (arrayName === "sex") {
            changeFilteredTimelineSexData(returnedArr);
          } else {
            changeFilteredTimelineRaceData(returnedArr);
          }
        };
      }
    },
    [timelineWorkerInstance]
  );

  const [filteredAgeGroupData, changeFilteredAgeGroupData] = useState([]);
  const [filteredRaceUniqueValues, changeFilteredRaceUniqueValues] = useState(
    []
  );
  const [filteredSexUniqueValues, changeFilteredSexUniqueValues] = useState([]);
  const [
    filteredBoroughUniqueValues,
    changeFilteredBoroughUniqueValues,
  ] = useState([]);
  const [
    filteredOffenseDescriptionUniqueValues,
    changeFilteredOffenseDescriptionUniqueValues,
  ] = useState([]);
  const [ageGroupData, changeAgeGroupData] = useState([]);
  const [raceUniqueValues, changeRaceUniqueValues] = useState([]);
  const [boroughUniqueValues, changeBoroughUniqueValues] = useState([]);
  const [
    offenseDescriptionUniqueValues,
    changeOffenseDescriptionUniqueValues,
  ] = useState([]);

  useEffect(() => {
    if (filteredDataChanged) {
      dispatch(ACTION_FILTERED_DATA_CHANGED_RESET());

      const expectedTotal = loadedYears
        .map((x) => yearlyTotals[x])
        .reduce((a, b) => a + b, 0);

      if (totalCount === expectedTotal) {
        postToMapFilterWorker(
          filteredData,
          "filteredArrestCategory",
          "LAW_CAT_CD"
        );
        postToMapFilterWorker(filteredData, "filteredAgeGroup", "AGE_GROUP");
        postToMapFilterWorker(filteredData, "filteredSexArr", "PERP_SEX");
        postToMapFilterWorker(filteredData, "filteredRaceArr", "PERP_RACE");
        postToMapFilterWorker(
          filteredData,
          "filteredBoroughArr",
          "ARREST_BORO"
        );
        postToMapFilterWorker(
          filteredData,
          "filteredOffenseDescriptionArr",
          "OFNS_DESC"
        );

        postToMapFilterWorker(
          filteredDataChunks,
          "filteredUniqueCategory",
          "LAW_CAT_CD"
        );
        postToMapFilterWorker(
          filteredDataChunks,
          "filteredUniqueDates",
          "ARREST_DATE"
        );

        postToTimelineWorker(filteredDataChunks, "age_group", "AGE_GROUP");
        postToTimelineWorker(filteredDataChunks, "borough", "ARREST_BORO");
        postToTimelineWorker(filteredDataChunks, "category", "LAW_CAT_CD");
        postToTimelineWorker(filteredDataChunks, "sex", "PERP_SEX");
        postToTimelineWorker(filteredDataChunks, "race", "PERP_RACE");
      }
    }
  }, [
    filteredDataChanged,
    ageGroup,
    boroughArr,
    filteredAgeGroup,
    filteredBoroughArr,
    filteredData,
    filteredOffenseDescriptionArr,
    filteredRaceArr,
    filteredSexArr,
    offenseDescriptionArr,
    postToMapFilterWorker,
    raceArr,
    dispatch,
    filteredDataChunks,
    postToTimelineWorker,
    filteredUniqueCategory,
    filteredTimelineCategoryData,
    filteredUniqueDates,
    loadedYears,
    totalCount,
  ]);

  useEffect(() => {
    if (!mapError) {
      while (totalCount === 0) {
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
  }, [totalCount, loaderColor, mapError]);

  // Used to prevent rubber banding effect on mobile phones
  useEffect(() => {
    iNoBounce.enable();
  }, []);

  const token = process.env.REACT_APP_MAPBOX_TOKEN;

  const showTooltip = useCallback(
    (object, x, y) => {
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
    },
    [tooltipVisible]
  );

  const renderLayers = useCallback(() => {
    const yearsFiltered = filteredDataChunks.map((item) =>
      Number(dayjs(item[5]["ARREST_DATE"], "MM/DD/YYYY").format("YYYY"))
    );

    layersRef.current = filteredDataChunks.map((chunk, chunkIndex) => {
      const yearOfChunk = dayjs(chunk[5]["ARREST_DATE"], "MM/DD/YYYY").format(
        "YYYY"
      );

      return new ScatterplotLayer({
        id: `chunk-${chunkIndex}`,
        data: chunk,
        visible: yearsFiltered.flat().includes(Number(yearOfChunk)),
        filled: true,
        radiusMinPixels: 2,
        getPosition: (d) => [Number(d.Longitude), Number(d.Latitude)],
        getFillColor: (d) =>
          d.LAW_CAT_CD === "F"
            ? [255, 0, 0]
            : d.LAW_CAT_CD === "M"
            ? [255, 116, 0]
            : [255, 193, 0],
        pickable: true,
        useDevicePixels: false,
      });
    });
  }, [filteredDataChunks]);

  const onNewDataArrive = useCallback(
    (chunk, dataIndex) => {
      const chunkYear = chunk.year;

      // Year does not exist, create new year and add data
      if (!loadDataChunks[0][chunkYear.toString()]) {
        dispatch(ACTION_LOAD_DATA_CHUNKS_ADD_YEAR(chunk.data, chunkYear));
      } else {
        // Year exists, add additional data to it
        dispatch(ACTION_LOAD_DATA_CHUNKS_ADD_TO_YEAR(chunk.data, chunkYear));
      }

      if (filteredDataChunks[dataIndex]) {
        dispatch(
          ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR(chunk.data, dataIndex)
        );
        dispatch(ACTION_ASSIGN_FILTERED_DATA(filteredDataChunks.flat()));
        dispatch(ACTION_FILTERED_DATA_CHANGED());
      } else {
        dispatch(ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR(chunk.data));
        dispatch(ACTION_ASSIGN_FILTERED_DATA(filteredDataChunks.flat()));
        dispatch(ACTION_FILTERED_DATA_CHANGED());
      }

      const currentYearDataLength = loadDataChunks[0][chunkYear.toString()]
        .map((x) => x.length)
        .reduce((a, b) => a + b, 0);

      progressVal.current = (
        currentYearDataLength / yearlyTotals[chunkYear]
      ).toFixed(1);

      if (
        layersRef.current.length === 0 ||
        layersRef.current.length !== filteredDataChunks.length
      ) {
        if (loadDataChunks[0][chunkYear.toString()]) {
          if (currentYearDataLength === yearlyTotals[chunkYear]) {
            renderLayers();
          }
        }
      }
    },
    [loadDataChunks, filteredDataChunks, renderLayers, dispatch]
  );

  useEffect(() => {
    if (
      fetchProgress !== 1 &&
      (filteredDataChunks.length === 0 ||
        (typeof filteredDataChunks === "object" && filteredData.length < 70000))
    ) {
      const progressInt = setInterval(() => {
        if (Number(fetchProgress) !== Number(progressVal.current)) {
          changeFetchProgress(Number(progressVal.current));
        }
      }, 500);

      return () => {
        clearInterval(progressInt);
      };
    }
  }, [fetchProgress, filteredDataChunks, filteredData]);

  const dataFetch = useCallback(
    (year, dataIndex) => {
      if (workerInstance) {
        // Send from main thread to web worker
        workerInstance.postMessage(year);

        workerInstance.onmessage = (receivedData) => {
          const data = JSON.parse(receivedData.data);

          dispatch(ACTION_INCREMENT_TOTAL_COUNT(JSON.parse(data.data).length));

          onNewDataArrive(
            { year: data.year, data: JSON.parse(data.data) },
            dataIndex
          );
        };
      }
    },
    [onNewDataArrive, workerInstance, dispatch]
  );

  const setFilters = (
    year,
    category,
    offense,
    age,
    race,
    sex,
    borough,
    suppliedData
  ) => {
    changeCurrentFilters({
      year: year,
      category: category,
      offense: offense,
      age: age,
      race: race,
      sex: sex,
      borough: borough,
    });

    const assignFilteredData = [suppliedData].map((chunk) => {
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

    const assignFilteredDataFlat = assignFilteredData.flat();

    dispatch(ACTION_ASSIGN_FILTERED_DATA_CHUNKS(assignFilteredData));

    dispatch(ACTION_ASSIGN_FILTERED_DATA(assignFilteredDataFlat));

    dispatch(ACTION_FILTERED_DATA_CHANGED());

    setTimeout(() => changeLaddaLoading(false), 2000);
  };

  useEffect(() => {
    if (currentFilters && prevFilters) {
      if (!isSame(Object.values(currentFilters), Object.values(prevFilters))) {
        renderLayers();
      }
    }
  }, [currentFilters, prevFilters, renderLayers, dispatch, filteredDataChunks]);

  const handleDownloadYear = (year) => {
    changeLoadingYears([year]);
    changeYearFilter([...yearFilter, year]);
    changeCategoryFilter([]);
    changeBoroughFilter([]);
    changeOffenseFilter([]);
    changeSexFilter([]);
    changeRaceFilter([]);
    changeAgeFilter([]);
    changeFetchProgress(0);
    changeModalActive({ active: true, year: year });
    setFilters([...loadedYears, year], [], [], [], [], [], [], loadData);
  };

  useEffect(() => {
    if (!mapFilterWorkerInstance) {
      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob(
          [
            "(",

            (() => {
              onmessage = (e) => {
                const uniqueValues = (value, index, self) => {
                  return self.indexOf(value) === index;
                };

                const dataSent = e.data;

                const chunk = dataSent.chunk.flat();
                const arrName = dataSent.arrName;
                const filterExactName = dataSent.filterExactName;

                if (
                  arrName === "filteredUniqueCategory" ||
                  arrName === "filteredUniqueDates"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk
                        .map((x) => x[filterExactName])
                        .filter((x) => x !== filterExactName)
                        .filter(uniqueValues),
                    })
                  );
                } else if (
                  arrName.includes("filtered") &&
                  arrName !== "filteredBoroughArr" &&
                  arrName !== "filteredOffenseDescriptionArr"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk
                        .map((x) => x[filterExactName])
                        .filter((x) => x !== filterExactName),
                    })
                  );
                } else if (
                  arrName === "boroughArr" ||
                  arrName === "filteredBoroughArr"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk
                        .map((x) => {
                          if (
                            x[filterExactName] === "K" &&
                            Number(x.Latitude) > 40.73912
                          ) {
                            return "B";
                          } else if (
                            x[filterExactName] === "M" &&
                            Number(x.Longitude) > -73.920961 &&
                            Number(x.Latitude) < 40.800709
                          ) {
                            return "Q";
                          } else if (
                            x[filterExactName] === "B" &&
                            Number(x.Latitude) < 40.697465
                          ) {
                            return "K";
                          } else if (
                            x[filterExactName] === "Q" &&
                            Number(x.Longitude) < -73.962745
                          ) {
                            return "M";
                          } else if (
                            x[filterExactName] === "Q" &&
                            Number(x.Longitude) < -73.878559 &&
                            Number(x.Latitude) > 40.787907
                          ) {
                            return "B";
                          } else {
                            return x[filterExactName];
                          }
                        })
                        .filter((x) => x !== filterExactName),
                    })
                  );
                } else if (
                  arrName === "offenseDescriptionArr" ||
                  arrName === "filteredOffenseDescriptionArr"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk.map(
                        (x) =>
                          x[filterExactName] !== "OFNS_DESC" &&
                          x[filterExactName]
                      ),
                    })
                  );
                } else {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk
                        .map((x) => x[filterExactName])
                        .filter((x) => x !== filterExactName),
                    })
                  );
                }
              };
            }).toString(),

            ")()",
          ],
          { type: "application/javascript" }
        )
      );

      const mapFilterWorker = new Worker(blobURL);

      changeMapFilterWorkerInstance(mapFilterWorker);
    }
  }, [mapFilterWorkerInstance]);

  useEffect(() => {
    if (!timelineWorkerInstance) {
      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob(
          [
            "(",

            (() => {
              onmessage = (e) => {
                const dataSent = e.data;

                const chunk = dataSent.chunk;
                const filterGeneralName = dataSent.filterGeneralName;
                const filterExactName = dataSent.filterExactName;

                if (filterGeneralName === "category") {
                  postMessage(
                    JSON.stringify({
                      arrayName: filterGeneralName,
                      returnedArr: chunk.map((item) =>
                        item
                          .map((x) => {
                            return {
                              date: x["ARREST_DATE"],
                              [filterGeneralName]:
                                x[filterExactName] === "F"
                                  ? "Felony"
                                  : x[filterExactName] === "M"
                                  ? "Misdemeanor"
                                  : "Violation",
                            };
                          })
                          .filter(
                            (x) =>
                              x.date !== "ARREST_DATE" &&
                              x[filterGeneralName] !== filterExactName
                          )
                      ),
                    })
                  );
                } else if (filterGeneralName === "sex") {
                  postMessage(
                    JSON.stringify({
                      arrayName: filterGeneralName,
                      returnedArr: chunk.map((item) =>
                        item
                          .map((x) => {
                            return {
                              date: x["ARREST_DATE"],
                              [filterGeneralName]:
                                x[filterExactName] === "F" ? "Female" : "Male",
                            };
                          })
                          .filter(
                            (x) =>
                              x.date !== "ARREST_DATE" &&
                              x[filterGeneralName] !== filterExactName
                          )
                      ),
                    })
                  );
                } else {
                  postMessage(
                    JSON.stringify({
                      arrayName: filterGeneralName,
                      returnedArr: chunk.map((item) => {
                        if (item instanceof Array) {
                          return item
                            .map((x) => {
                              return {
                                date: x["ARREST_DATE"],
                                [filterGeneralName]: x[filterExactName],
                              };
                            })
                            .filter(
                              (x) =>
                                x.date !== "ARREST_DATE" &&
                                x[filterGeneralName] !== filterExactName
                            );
                        } else {
                          return null;
                        }
                      }),
                    })
                  );
                }
              };
            }).toString(),

            ")()",
          ],
          { type: "application/javascript" }
        )
      );

      const timelineWorker = new Worker(blobURL);

      changeTimelineWorkerInstance(timelineWorker);
    }
  }, [timelineWorkerInstance]);

  useEffect(() => {
    if (!timelineGraphWorkerInstance) {
      const worker = new timelineGraphWorker();

      changeTimelineGraphWorkerInstance(worker);
    }
  }, [timelineGraphWorkerInstance]);

  useEffect(() => {
    if (!filterWorkerInstance) {
      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob(
          [
            "(",

            (() => {
              onmessage = (e) => {
                const uniqueValues = (value, index, self) => {
                  return self.indexOf(value) === index;
                };

                const hasNumber = (input) => {
                  return /\d/.test(input);
                };

                const dataSent = e.data;

                const name = dataSent.arrName;
                const arr = dataSent.arr;

                if (
                  name === "filteredAgeGroupData" ||
                  name === "ageGroupData"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: name,
                      returnedArr: arr
                        ? arr.filter(uniqueValues).sort((a, b) => {
                            const first = hasNumber(a)
                              ? Number(
                                  a.split(a[0] === "<" ? "<" : "-")[
                                    a[0] === "<" ? 1 : 0
                                  ]
                                )
                              : null;
                            const second = hasNumber(b)
                              ? Number(
                                  b.split(b[0] === "<" ? "<" : "-")[
                                    b[0] === "<" ? 1 : 0
                                  ]
                                )
                              : null;

                            return first - second;
                          })
                        : [],
                    })
                  );
                } else {
                  postMessage(
                    JSON.stringify({
                      arrayName: name,
                      returnedArr: arr ? arr.filter(uniqueValues).sort() : [],
                    })
                  );
                }
              };
            }).toString(),

            ")()",
          ],
          { type: "application/javascript" }
        )
      );

      const filterWorker = new Worker(blobURL);

      changeFilterWorkerInstance(filterWorker);
    }
  }, [filterWorkerInstance]);

  useEffect(() => {
    if (!workerInstance) {
      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob(
          [
            "(",

            (() => {
              // Creates new websocket instance
              let ws = new WebSocket("ws://localhost:4000");

              if (process.env.NODE_ENV === "production") {
                const host = window.location.href.replace(/^http/, "ws");

                ws = new WebSocket(host);
              }

              onmessage = (e) => {
                const year = e.data;

                if (ws.readyState === 1) {
                  // Receive from main thread and send to websocket
                  ws.send(year);
                }

                ws.onopen = () => {
                  // Send one bite to websocket every 55 seconds to keep socket from closing itself on idle
                  setInterval(() => {
                    ws.send(".");
                  }, 55000);

                  // Receive from main thread and send to websocket
                  ws.send(year);
                };

                // Send from websocket to main thread
                ws.onmessage = ({ data }) => {
                  // Faster to JSON.stringify() then postMessage() a string than to postMessage() an object.
                  if (data) {
                    postMessage(JSON.stringify({ year: year, data: data }));
                  }
                };
              };
            }).toString(),

            ")()",
          ],
          { type: "application/javascript" }
        )
      );

      const socketWorker = new Worker(blobURL);

      changeWorkerInstance(socketWorker);
    }
  }, [workerInstance]);

  useEffect(() => {
    if (workerInstance) {
      if (!loadedYears.includes(2020)) {
        if (loadingYears.length === 0) {
          changeLoadingYears([2020]);
          dataFetch(2020, filteredDataChunks.length);
        }
      } else {
        if (loadingYears.length > 0 && !loadDataChunks[0][loadingYears[0]]) {
          dataFetch(loadingYears[0], filteredDataChunks.length);
          changeLoadingYears([]);
        }
      }
    }
  }, [
    workerInstance,
    dataFetch,
    loadedYears,
    loadingYears,
    loadDataChunks,
    filteredDataChunks.length,
  ]);

  useEffect(() => {
    if (totalCount > 70000 && ageGroupTimelineGraphData.length === 0) {
      if (!mapVisible) {
        changeMapVisible(true);
      }
    }
  }, [totalCount, mapVisible, ageGroupTimelineGraphData.length]);

  return (
    <>
      {totalCount < 70000 || ageGroupTimelineGraphData.length === 0 ? (
        <InitialLoader
          fetchProgress={fetchProgress}
          countUp={countUp}
          loaderColor={loaderColor}
          mapError={mapError}
        />
      ) : null}
      {modalActive.active && modalActive.year ? (
        <SubsequentLoader
          modalActive={modalActive}
          changeModalActive={changeModalActive}
        />
      ) : null}
      <div
        className="nypd_arrest_map_container"
        style={{
          opacity:
            totalCount < 70000 || ageGroupTimelineGraphData.length === 0
              ? 0
              : 1,
        }}
      >
        <NavigationBar
          loadData={loadData}
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
          layers={layersRef.current}
          pickingRadius={10}
          controller={true}
          onLoad={() => changeMapLoaded(true)}
          onError={(e) => changeMapError(true)}
          onHover={({ object, x, y }) => showTooltip(object, x, y)}
          onClick={({ object, x, y }) => showTooltip(object, x, y)}
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
          />
        ) : null}
      </div>
    </>
  );
};

export default App;
