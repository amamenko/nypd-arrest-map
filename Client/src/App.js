import React, { useCallback, useEffect, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { StaticMap } from "react-map-gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import "./App.css";
import "./mapbox.css";
import NavigationBar from "./NavigationBar/NavigationBar";
import BottomInfoPanel from "./BottomInfoPanel/BottomInfoPanel";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import yearlyTotals from "./YearlyTotals";
import { useCountUp } from "react-countup";
import InitialLoader from "./InitialLoader";
import SubsequentLoader from "./SubsequentLoader";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR from "./actions/filteredDataChunks/ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR";
import ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR from "./actions/filteredDataChunks/ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR";
import ACTION_ASSIGN_FILTERED_DATA_CHUNKS from "./actions/filteredDataChunks/ACTION_ASSIGN_FILTERED_DATA_CHUNKS";
import ACTION_INCREMENT_TOTAL_COUNT from "./actions/totalCount/ACTION_INCREMENT_TOTAL_COUNT";
import ACTION_ASSIGN_LOAD_DATA from "./actions/loadData/ACTION_ASSIGN_LOAD_DATA";
import ACTION_FILTERED_DATA_CHANGED from "./actions/filteredData/ACTION_FILTERED_DATA_CHANGED";
import ACTION_FILTERED_DATA_CHANGED_RESET from "./actions/filteredData/ACTION_FILTERED_DATA_CHANGED_RESET";
import ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA from "./actions/timelineGraphData/ageGroup/ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA";
import ACTION_TIMELINE_BOROUGH_GRAPH_DATA from "./actions/timelineGraphData/borough/ACTION_TIMELINE_BOROUGH_GRAPH_DATA";
import ACTION_TIMELINE_CATEGORY_GRAPH_DATA from "./actions/timelineGraphData/category/ACTION_TIMELINE_CATEGORY_GRAPH_DATA";
import ACTION_TIMELINE_GENDER_GRAPH_DATA from "./actions/timelineGraphData/gender/ACTION_TIMELINE_GENDER_GRAPH_DATA";
import ACTION_TIMELINE_RACE_GRAPH_DATA from "./actions/timelineGraphData/race/ACTION_TIMELINE_RACE_GRAPH_DATA";
import setFilterAndTimelineGraphWorkers from "worker-loader!./setFilterAndTimelineGraphWorkers.js"; // eslint-disable-line import/no-webpack-loader-syntax
import ACTION_AGE_TIMELINE_COLUMNS from "./actions/timelineColumns/age/ACTION_AGE_TIMELINE_COLUMNS";
import ACTION_BOROUGH_TIMELINE_COLUMNS from "./actions/timelineColumns/borough/ACTION_BOROUGH_TIMELINE_COLUMNS";
import ACTION_CATEGORY_TIMELINE_COLUMNS from "./actions/timelineColumns/category/ACTION_CATEGORY_TIMELINE_COLUMNS";
import ACTION_SEX_TIMELINE_COLUMNS from "./actions/timelineColumns/sex/ACTION_SEX_TIMELINE_COLUMNS";
import ACTION_RACE_TIMELINE_COLUMNS from "./actions/timelineColumns/race/ACTION_RACE_TIMELINE_COLUMNS";
import ACTION_APPLYING_FILTERS_RESET from "./actions/applyingFilters/ACTION_APPLYING_FILTERS_RESET";
import ApplyingFiltersPopUp from "./ApplyingFiltersPopUp/ApplyingFiltersPopUp";
import ACTION_NEW_YEAR_FINISHED_LOADING_RESET from "./actions/newYearFinishedLoading/ACTION_NEW_YEAR_FINISHED_LOADING_RESET";
import ACTION_NEW_YEAR_FINISHED_LOADING from "./actions/newYearFinishedLoading/ACTION_NEW_YEAR_FINISHED_LOADING";
import ACTION_TRENDS_AVAILABLE from "./actions/trendsAvailable/ACTION_TRENDS_AVAILABLE";
import ACTION_TRENDS_NOT_AVAILABLE from "./actions/trendsAvailable/ACTION_TRENDS_NOT_AVAILABLE";
import Div100vh from "react-div-100vh";
import { useMediaQuery } from "react-responsive";
import { FcRotateToLandscape } from "react-icons/fc";
import ACTION_RESET_FILTERS_RESET from "./actions/resetFilters/ACTION_RESET_FILTERS_RESET";

dayjs.extend(customParseFormat);

const App = () => {
  const dispatch = useDispatch();

  const loadData = useSelector((state) => state.loadDataReducer.data);
  const filteredDataChanged = useSelector(
    (state) => state.filteredDataReducer.changed
  );
  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );
  const newYearFinishedLoading = useSelector(
    (state) => state.newYearFinishedLoadingReducer.finished
  );

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );
  const resetFilters = useSelector((state) => state.resetFiltersReducer.reset);

  const totalCount = useSelector((state) => state.totalCountReducer.total);

  const ageGroupTimelineGraphData = useSelector(
    (state) => state.ageGroupTimelineGraphDataReducer.data
  );
  const boroughTimelineGraphData = useSelector(
    (state) => state.boroughTimelineGraphDataReducer.data
  );
  const categoryTimelineGraphData = useSelector(
    (state) => state.categoryTimelineGraphDataReducer.data
  );
  const genderTimelineGraphData = useSelector(
    (state) => state.genderTimelineGraphDataReducer.data
  );
  const raceTimelineGraphData = useSelector(
    (state) => state.raceTimelineGraphDataReducer.data
  );

  // Timeline Column Data
  const ageTimelineColumns = useSelector(
    (state) => state.ageTimelineColumnsReducer.columns
  );
  const boroughTimelineColumns = useSelector(
    (state) => state.boroughTimelineColumnsReducer.columns
  );
  const categoryTimelineColumns = useSelector(
    (state) => state.categoryTimelineColumnsReducer.columns
  );
  const raceTimelineColumns = useSelector(
    (state) => state.raceTimelineColumnsReducer.columns
  );
  const sexTimelineColumns = useSelector(
    (state) => state.sexTimelineColumnsReducer.columns
  );

  const [mapLoaded, changeMapLoaded] = useState(false);
  const [tooltipVisible, changeTooltipVisible] = useState(false);
  const [loaderColor, changeLoaderColor] = useState("rgb(93, 188, 210)");
  const [mapError, changeMapError] = useState(false);
  const [modalActive, changeModalActive] = useState({
    active: false,
    year: null,
  });
  const [mapPostsCompleted, changeMapPostsCompleted] = useState(false);
  const [
    readyForTimelineColumnPosts,
    changeReadyForTimelineColumnPosts,
  ] = useState(false);
  const [graphOption, changeGraphOption] = useState("overview");
  const [footerMenuActive, changeFooterMenuActive] = useState(false);

  const [currentFilters, changeCurrentFilters] = useState({
    category: [],
    offense: [],
    age: [],
    race: [],
    sex: [],
    borough: [],
  });

  const isTinyPhone = useMediaQuery({ maxWidth: 375 });
  const isMobileOrTablet = useMediaQuery({ maxWidth: 1224 });
  const isTablet = useMediaQuery({ minWidth: 768 });
  const isMediumLaptop = useMediaQuery({ maxWidth: 1440 });
  const isPortrait = useMediaQuery({ orientation: "portrait" });

  const [laddaLoading, changeLaddaLoading] = useState(false);
  const [resetLaddaLoading, changeResetLaddaLoading] = useState(false);
  const [loadingYears, changeLoadingYears] = useState([]);

  // Web Worker Instances
  const [workerInstance, changeWorkerInstance] = useState("");
  const [mapFilterWorkerInstance, changeMapFilterWorkerInstance] = useState("");
  const [filterWorkerInstance, changeFilterWorkerInstance] = useState("");
  const [timelineWorkerInstance, changeTimelineWorkerInstance] = useState("");
  const [
    setFilterAndTimelineGraphWorkersInstance,
    changeSetFilterAndTimelineGraphWorkersInstance,
  ] = useState("");

  const [mapVisible, changeMapVisible] = useState(false);

  // Side Menu Bar States
  const [menuClicked, changeMenuClicked] = useState(false);
  const [collapseOpen, changeCollapseOpen] = useState("");

  let layersRef = useRef([]);
  let applyingFiltersProgressRef = useRef(0);
  const deckGLRef = useRef(null);

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

  const { countUp, update } = useCountUp({
    start: 0,
    end:
      loadData.length > 0
        ? Number((loadData.length / yearlyTotals["2020"]).toFixed(1)) * 100
        : 0,
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    if (loadData.length > 0) {
      const newProgress =
        Number((loadData.length / yearlyTotals["2020"]).toFixed(1)) * 100;

      if (newProgress >= 60) {
        update(100);
      } else {
        update(newProgress);
      }
    }
  }, [update, countUp, loadData]);

  const isSame = (arr1, arr2) =>
    arr1.length === arr2.length &&
    arr1.every((item, i) => {
      return item === arr2[i];
    });

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
    (ageObj, raceObj, categoryObj, sexObj, boroughObj) => {
      if (setFilterAndTimelineGraphWorkersInstance) {
        // Send from main thread to web worker
        setFilterAndTimelineGraphWorkersInstance.postMessage({
          ageObj,
          raceObj,
          categoryObj,
          sexObj,
          boroughObj,
        });

        setFilterAndTimelineGraphWorkersInstance.onmessage = (receivedData) => {
          applyingFiltersProgressRef.current += 25;

          const ageGroupTimelineGraphData =
            receivedData.data.ageGroupTimelineGraphData;
          const raceTimelineGraphData = receivedData.data.raceTimelineGraphData;
          const categoryTimelineGraphData =
            receivedData.data.categoryTimelineGraphData;
          const genderTimelineGraphData =
            receivedData.data.genderTimelineGraphData;
          const boroughTimelineGraphData =
            receivedData.data.boroughTimelineGraphData;

          dispatch(
            ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA(ageGroupTimelineGraphData)
          );
          dispatch(
            ACTION_TIMELINE_BOROUGH_GRAPH_DATA(boroughTimelineGraphData)
          );
          dispatch(
            ACTION_TIMELINE_CATEGORY_GRAPH_DATA(categoryTimelineGraphData)
          );
          dispatch(ACTION_TIMELINE_GENDER_GRAPH_DATA(genderTimelineGraphData));
          dispatch(ACTION_TIMELINE_RACE_GRAPH_DATA(raceTimelineGraphData));
        };
      }
    },
    [setFilterAndTimelineGraphWorkersInstance, dispatch]
  );

  const postToFilteredWorker = useCallback(
    (
      ageGroup,
      raceArr,
      boroughArr,
      offenseDescriptionArr,
      filteredAgeGroup,
      filteredSexArr,
      filteredRaceArr,
      filteredBoroughArr,
      filteredOffenseDescriptionArr
    ) => {
      if (filterWorkerInstance) {
        // Send from main thread to web worker
        filterWorkerInstance.postMessage({
          ageGroup,
          raceArr,
          boroughArr,
          offenseDescriptionArr,
          filteredAgeGroup,
          filteredSexArr,
          filteredRaceArr,
          filteredBoroughArr,
          filteredOffenseDescriptionArr,
        });

        filterWorkerInstance.onmessage = (receivedData) => {
          applyingFiltersProgressRef.current += 25;

          const parsedData = JSON.parse(receivedData.data);

          const ageGroupData = parsedData.ageGroupData;
          const raceUniqueValues = parsedData.raceUniqueValues;
          const boroughUniqueValues = parsedData.boroughUniqueValues;
          const offenseDescriptionArr = parsedData.offenseDescriptionArr;
          const filteredAgeGroupData = parsedData.filteredAgeGroupData;
          const filteredSexUniqueValues = parsedData.filteredSexUniqueValues;
          const filteredRaceUniqueValues = parsedData.filteredRaceUniqueValues;
          const filteredBoroughUniqueValues =
            parsedData.filteredBoroughUniqueValues;
          const filteredOffenseDescriptionUniqueValues =
            parsedData.filteredOffenseDescriptionUniqueValues;

          changeFilteredAgeGroupData(filteredAgeGroupData);
          changeFilteredRaceUniqueValues(filteredRaceUniqueValues);
          changeFilteredSexUniqueValues(filteredSexUniqueValues);
          changeFilteredBoroughUniqueValues(filteredBoroughUniqueValues);
          changeFilteredOffenseDescriptionUniqueValues(
            filteredOffenseDescriptionUniqueValues
          );
          changeAgeGroupData(ageGroupData);
          changeRaceUniqueValues(raceUniqueValues);
          changeBoroughUniqueValues(boroughUniqueValues);
          changeOffenseDescriptionUniqueValues(offenseDescriptionArr);
          changeReadyForTimelineColumnPosts(true);
        };
      }
    },
    [filterWorkerInstance]
  );

  const postToMapFilterWorker = useCallback(
    (loadData, filteredDataChunks, currentFilters) => {
      if (mapFilterWorkerInstance) {
        // Send from main thread to web worker
        mapFilterWorkerInstance.postMessage({
          loadData,
          filteredDataChunks,
          currentFilters,
        });

        mapFilterWorkerInstance.onmessage = (receivedData) => {
          applyingFiltersProgressRef.current += 25;

          const parsedData = JSON.parse(receivedData.data);

          const ageGroup = parsedData.ageGroup;
          const raceArr = parsedData.raceArr;
          const boroughArr = parsedData.boroughArr;
          const offenseDescriptionArr = parsedData.offenseDescriptionArr;
          const filteredArrestCategory = parsedData.filteredArrestCategory;
          const filteredAgeGroup = parsedData.filteredAgeGroup;
          const filteredSexArr = parsedData.filteredSexArr;
          const filteredRaceArr = parsedData.filteredRaceArr;
          const filteredBoroughArr = parsedData.filteredBoroughArr;
          const filteredOffenseDescriptionArr =
            parsedData.filteredOffenseDescriptionArr;
          const filteredUniqueCategory = parsedData.filteredUniqueCategory;

          postToFilteredWorker(
            ageGroup,
            raceArr,
            boroughArr,
            offenseDescriptionArr,
            filteredAgeGroup,
            filteredSexArr,
            filteredRaceArr,
            filteredBoroughArr,
            filteredOffenseDescriptionArr
          );

          changeAgeGroup(ageGroup);
          changeRaceArr(raceArr);
          changeBoroughArr(boroughArr);
          changeOffenseDescriptionArr(offenseDescriptionArr);
          changeFilteredArrestCategory(filteredArrestCategory);
          changeFilteredAgeGroup(filteredAgeGroup);
          changeFilteredSexArr(filteredSexArr);
          changeFilteredRaceArr(filteredRaceArr);
          changeFilteredBoroughArr(filteredBoroughArr);
          changeFilteredOffenseDescriptionArr(filteredOffenseDescriptionArr);
          changeFilteredUniqueCategory(filteredUniqueCategory);
        };
      }
    },
    [mapFilterWorkerInstance, postToFilteredWorker]
  );

  const postToTimelineWorker = useCallback(
    (chunk) => {
      if (timelineWorkerInstance) {
        // Send from main thread to web worker
        timelineWorkerInstance.postMessage({ chunk });

        timelineWorkerInstance.onmessage = (receivedData) => {
          applyingFiltersProgressRef.current += 25;

          const parsedData = JSON.parse(receivedData.data);

          const age_group = parsedData.age_group;
          const borough = parsedData.borough;
          const category = parsedData.category;
          const sex = parsedData.sex;
          const race = parsedData.race;

          changeFilteredTimelineAgeGroupData(age_group);
          changeFilteredTimelineBoroughData(borough);
          changeFilteredTimelineCategoryData(category);
          changeFilteredTimelineSexData(sex);
          changeFilteredTimelineRaceData(race);
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
    if (readyForTimelineColumnPosts) {
      changeReadyForTimelineColumnPosts(false);

      postToTimelineGraphWorker(
        { unique: filteredAgeGroupData, data: filteredTimelineAgeGroupData },
        { unique: filteredRaceUniqueValues, data: filteredTimelineRaceData },
        { unique: filteredUniqueCategory, data: filteredTimelineCategoryData },
        { unique: filteredSexUniqueValues, data: filteredTimelineSexData },
        {
          unique: filteredBoroughUniqueValues,
          data: filteredTimelineBoroughData,
        }
      );
    }
  }, [
    categoryTimelineGraphData.length,
    filteredAgeGroupData,
    filteredBoroughUniqueValues,
    filteredRaceUniqueValues,
    filteredSexUniqueValues,
    filteredTimelineAgeGroupData,
    filteredTimelineBoroughData,
    filteredTimelineCategoryData,
    filteredTimelineRaceData,
    filteredTimelineSexData,
    filteredUniqueCategory,
    postToTimelineGraphWorker,
    readyForTimelineColumnPosts,
  ]);

  const renderLayers = useCallback(() => {
    if (applyingFiltersProgressRef.current !== 0) {
      applyingFiltersProgressRef.current = 0;
    }

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

  useEffect(() => {
    const expectedTotal = yearlyTotals["2020"];

    if (newYearFinishedLoading) {
      dispatch(ACTION_NEW_YEAR_FINISHED_LOADING_RESET());
      if (totalCount === expectedTotal && loadData.length === expectedTotal) {
        dispatch(ACTION_ASSIGN_FILTERED_DATA_CHUNKS([loadData]));

        dispatch(ACTION_FILTERED_DATA_CHANGED());
      }
    }
  }, [newYearFinishedLoading, loadData, dispatch, totalCount]);

  useEffect(() => {
    if (!filteredDataChanged) {
      if (mapPostsCompleted) {
        changeMapPostsCompleted(false);
      }
    }
  }, [filteredDataChanged, mapPostsCompleted]);

  useEffect(() => {
    const expectedTotal = yearlyTotals["2020"];

    if (totalCount > 0 && totalCount === expectedTotal) {
      if (filteredDataChanged) {
        if (!mapPostsCompleted) {
          renderLayers();

          postToMapFilterWorker(loadData, filteredDataChunks, currentFilters);
          postToTimelineWorker(filteredDataChunks);

          dispatch(ACTION_FILTERED_DATA_CHANGED_RESET());
        }

        changeMapPostsCompleted(true);
      }
    }
  }, [
    loadData,
    mapPostsCompleted,
    currentFilters,
    filteredDataChanged,
    renderLayers,
    ageGroup,
    boroughArr,
    filteredAgeGroup,
    filteredBoroughArr,
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
    totalCount,
  ]);

  const prevAgeGroupTimelineGraphData = usePrevious(ageGroupTimelineGraphData);
  const prevBoroughTimelineGraphData = usePrevious(boroughTimelineGraphData);
  const prevCategoryTimelineGraphData = usePrevious(categoryTimelineGraphData);
  const prevGenderTimelineGraphData = usePrevious(genderTimelineGraphData);
  const prevRaceTimelineGraphData = usePrevious(raceTimelineGraphData);

  useEffect(() => {
    if (ageGroupTimelineGraphData !== prevAgeGroupTimelineGraphData) {
      if (ageGroupTimelineGraphData.length > 0) {
        if (
          filteredAgeGroupData.length ===
          ageGroupTimelineGraphData[0].length - 1
        ) {
          dispatch(
            ACTION_AGE_TIMELINE_COLUMNS(
              [
                [{ type: "date", label: "Date" }].concat(
                  filteredAgeGroupData
                    .sort((a, b) => a.localeCompare(b))
                    .map((item) => (item === "65" ? "65+" : item))
                ),
              ].concat(ageGroupTimelineGraphData)
            )
          );
        }
      }
    }

    if (boroughTimelineGraphData !== prevBoroughTimelineGraphData) {
      if (boroughTimelineGraphData.length > 0) {
        if (
          filteredBoroughUniqueValues.length ===
          boroughTimelineGraphData[0].length - 1
        ) {
          dispatch(
            ACTION_BOROUGH_TIMELINE_COLUMNS(
              [
                [{ type: "date", label: "Date" }].concat(
                  filteredBoroughUniqueValues.map((borough) =>
                    borough === "B"
                      ? "Bronx"
                      : borough === "Q"
                      ? "Queens"
                      : borough === "M"
                      ? "Manhattan"
                      : borough === "K"
                      ? "Brooklyn"
                      : borough === "S"
                      ? "Staten Island"
                      : "Unknown"
                  )
                ),
              ].concat(boroughTimelineGraphData)
            )
          );
        }
      }
    }

    if (categoryTimelineGraphData !== prevCategoryTimelineGraphData) {
      if (
        categoryTimelineGraphData.length > 0 &&
        filteredUniqueCategory.length > 0
      ) {
        const categoryArr = [
          ...new Set(
            filteredUniqueCategory.map((x) =>
              x === "F" ? "Felony" : x === "M" ? "Misdemeanor" : "Violation"
            )
          ),
        ];

        if (categoryArr.length === categoryTimelineGraphData[0].length - 1) {
          dispatch(
            ACTION_CATEGORY_TIMELINE_COLUMNS(
              [[{ type: "date", label: "Date" }].concat(categoryArr)].concat(
                categoryTimelineGraphData
              )
            )
          );
        }
      }
    }

    if (genderTimelineGraphData !== prevGenderTimelineGraphData) {
      if (genderTimelineGraphData.length > 0) {
        const genderArr = filteredSexUniqueValues.map((x) =>
          x === "F" ? "Female" : "Male"
        );

        if (genderArr.length === genderTimelineGraphData[0].length - 1) {
          dispatch(
            ACTION_SEX_TIMELINE_COLUMNS(
              [[{ type: "date", label: "Date" }].concat(genderArr)].concat(
                genderTimelineGraphData
              )
            )
          );
        }
      }
    }

    if (raceTimelineGraphData !== prevRaceTimelineGraphData) {
      if (raceTimelineGraphData.length > 0) {
        const raceArr = filteredRaceUniqueValues.map((race) =>
          race
            .split(" ")
            .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
            .join(" ")
            .split("/")
            .map(
              (x) =>
                x[0].toUpperCase() +
                x.slice(1, x.indexOf(" ")).toLowerCase() +
                x.slice(x.indexOf(" "))
            )
            .join("/")
        );

        if (raceArr.length === raceTimelineGraphData[0].length - 1) {
          dispatch(
            ACTION_RACE_TIMELINE_COLUMNS(
              [[{ type: "date", label: "Date" }].concat(raceArr)].concat(
                raceTimelineGraphData
              )
            )
          );
        }

        dispatch(ACTION_TRENDS_AVAILABLE());

        if (applyingFilters) {
          dispatch(ACTION_APPLYING_FILTERS_RESET());
        }

        if (resetFilters) {
          dispatch(ACTION_RESET_FILTERS_RESET());
        }
      }
    }
  }, [
    ageGroupTimelineGraphData,
    boroughTimelineGraphData,
    categoryTimelineGraphData,
    dispatch,
    filteredAgeGroupData,
    genderTimelineGraphData,
    prevAgeGroupTimelineGraphData,
    prevBoroughTimelineGraphData,
    prevCategoryTimelineGraphData,
    prevGenderTimelineGraphData,
    prevRaceTimelineGraphData,
    raceTimelineGraphData,
    filteredBoroughUniqueValues,
    filteredUniqueCategory,
    filteredRaceUniqueValues,
    filteredSexUniqueValues,
    applyingFilters,
    resetFilters,
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

  const token = process.env.REACT_APP_MAPBOX_TOKEN;

  const showTooltip = useCallback(
    (object, x, y) => {
      const el = document.getElementsByClassName("deck-tooltip")[0];

      if (object) {
        if (!tooltipVisible) {
          changeTooltipVisible(true);
          document.addEventListener("touchstart", () => (el.style.opacity = 0));
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

  const onNewDataArrive = useCallback(
    (chunk, dataIndex, firstMessage, lastMessage) => {
      // Year does not exist, create new year and add data
      if (firstMessage) {
        dispatch(ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR(chunk.data));

        dispatch(ACTION_ASSIGN_LOAD_DATA(chunk.data));
      } else {
        if (lastMessage) {
          dispatch(ACTION_NEW_YEAR_FINISHED_LOADING());
        }

        // Year exists, add additional data to it
        dispatch(
          ACTION_FILTERED_DATA_CHUNKS_ADD_TO_YEAR(chunk.data, dataIndex)
        );

        dispatch(ACTION_ASSIGN_LOAD_DATA(chunk.data));
      }
    },
    [dispatch]
  );

  const dataFetch = useCallback(
    (year, dataIndex) => {
      if (workerInstance) {
        // Send from main thread to web worker
        workerInstance.postMessage(year);

        workerInstance.onmessage = (receivedData) => {
          const data = JSON.parse(receivedData.data);
          const parsedData = JSON.parse(data.data);
          const chunkArr = parsedData.chunkArr;
          const firstMessage = parsedData.firstMessage;
          const lastMessage = parsedData.lastMessage;

          dispatch(ACTION_INCREMENT_TOTAL_COUNT(chunkArr.length));

          onNewDataArrive(
            {
              year: data.year,
              data: chunkArr,
            },
            dataIndex,
            firstMessage,
            lastMessage
          );
        };
      }
    },
    [onNewDataArrive, workerInstance, dispatch]
  );

  const setFilters = (
    category,
    offense,
    age,
    race,
    sex,
    borough,
    suppliedData
  ) => {
    if (setFilterAndTimelineGraphWorkersInstance) {
      if (applyingFiltersProgressRef.current !== 0) {
        applyingFiltersProgressRef.current = 0;
      }

      if (graphOption === "trends") {
        changeGraphOption("overview");
      }
      changeCollapseOpen("");
      changeMenuClicked(false);
      dispatch(ACTION_TRENDS_NOT_AVAILABLE());

      // Send from main thread to web worker
      setFilterAndTimelineGraphWorkersInstance.postMessage({
        category: category,
        offense: offense,
        age: age,
        race: race,
        sex: sex,
        borough: borough,
        suppliedData: suppliedData,
      });

      setFilterAndTimelineGraphWorkersInstance.onmessage = (receivedData) => {
        const assignFilteredData = receivedData.data.assignFilteredData;

        if (assignFilteredData) {
          dispatch(ACTION_ASSIGN_FILTERED_DATA_CHUNKS(assignFilteredData));

          changeCurrentFilters({
            category: category,
            offense: offense,
            age: age,
            race: race,
            sex: sex,
            borough: borough,
          });

          dispatch(ACTION_FILTERED_DATA_CHANGED());
        }
      };

      setTimeout(() => changeLaddaLoading(false), 1000);
      setTimeout(() => changeResetLaddaLoading(false), 1000);
    }
  };

  useEffect(() => {
    if (currentFilters && prevFilters) {
      if (!isSame(Object.values(currentFilters), Object.values(prevFilters))) {
        renderLayers();
      }
    }
  }, [currentFilters, prevFilters, renderLayers, dispatch, filteredDataChunks]);

  useEffect(() => {
    if (!mapFilterWorkerInstance) {
      const response = `self.onmessage = (e) => {
        const dataSent = e.data;

        const loadData = dataSent.loadData;
        const filteredDataChunks = dataSent.filteredDataChunks;
        const currentFilters = dataSent.currentFilters;

        const filterArrIncluded = (
          x,
          filterExactName,
          filterGeneralName
        ) => {
          if (x !== filterExactName) {
            if (currentFilters[filterGeneralName]) {
              if (currentFilters[filterGeneralName].length > 0) {
                return currentFilters[filterGeneralName].includes(x);
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            return false;
          }
        };

        const dataReducerFunction = (
          chunk,
          filterExactName,
          filterGeneralName
        ) => {
          return chunk.reduce((acc, curr) => {
            const exactName = curr[filterExactName];

            if (filterArrIncluded(exactName, filterGeneralName)) {
              acc.push(exactName);
            }

            return acc;
          }, []);
        };

        const boroughLoadDataReducerFunction = (
          chunk,
          filterExactName
        ) => {
          return chunk.reduce((acc, curr) => {
            const currentName = (x) => {
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
            };

            const currentPushItem = currentName(curr);

            if (filterArrIncluded(currentPushItem)) {
              acc.push(currentPushItem);
            }

            return acc;
          }, []);
        };

        const filteredDataChunksReducerFunction = (
          filterExactName,
          filterGeneralName
        ) => {
          const yearsArr = filteredDataChunks.map((x) => {
            const date = x[5][filterExactName];

            return Number(date.substring(date.length - 4, date.length));
          });

          const dateFilterArrIncluded = (item, index, generalName) => {
            if (item !== filterExactName) {
              if (currentFilters[generalName]) {
                if (currentFilters[generalName].length > 0) {
                  if (
                    currentFilters[generalName].includes(
                      yearsArr[index]
                    )
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              } else {
                return false;
              }
            } else {
              return false;
            }
          };

          return filteredDataChunks
            .map((x, i) => [
              ...new Set(
                x.reduce((acc, curr) => {
                  const exactName = curr[filterExactName];

                  if (filterGeneralName === "category") {
                    if (
                      filterArrIncluded(
                        exactName,
                        filterExactName,
                        filterGeneralName
                      )
                    ) {
                      acc.push(exactName);
                    }
                  } else {
                    if (
                      dateFilterArrIncluded(
                        exactName,
                        i,
                        filterGeneralName
                      )
                    ) {
                      acc.push(exactName);
                    }
                  }

                  return acc;
                }, [])
              ),
            ])
            .flat();
        };

        postMessage(
          JSON.stringify({
            ageGroup: dataReducerFunction(loadData, "AGE_GROUP"),
            raceArr: dataReducerFunction(loadData, "PERP_RACE"),
            boroughArr: boroughLoadDataReducerFunction(
              loadData,
              "ARREST_BORO"
            ),
            offenseDescriptionArr: dataReducerFunction(
              loadData,
              "OFNS_DESC"
            ),
            filteredArrestCategory: dataReducerFunction(
              filteredDataChunks[0],
              "LAW_CAT_CD",
              "category"
            ),
            filteredAgeGroup: dataReducerFunction(
              filteredDataChunks[0],
              "AGE_GROUP",
              "age"
            ),
            filteredSexArr: dataReducerFunction(
              filteredDataChunks[0],
              "PERP_SEX",
              "sex"
            ),
            filteredRaceArr: dataReducerFunction(
              filteredDataChunks[0],
              "PERP_RACE",
              "race"
            ),
            filteredBoroughArr: boroughLoadDataReducerFunction(
              filteredDataChunks[0],
              "ARREST_BORO",
              "borough"
            ),
            filteredOffenseDescriptionArr: dataReducerFunction(
              filteredDataChunks[0],
              "OFNS_DESC",
              "offense"
            ),
            filteredUniqueCategory: filteredDataChunksReducerFunction(
              "LAW_CAT_CD",
              "category"
            ),
          })
        );
      };`;

      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob([response], { type: "application/javascript" })
      );

      const mapFilterWorker = new Worker(blobURL);

      changeMapFilterWorkerInstance(mapFilterWorker);
    }
  }, [mapFilterWorkerInstance]);

  useEffect(() => {
    if (!timelineWorkerInstance) {
      const response = `self.onmessage = (e) => {
        const dataSent = e.data;

        const chunk = dataSent.chunk;

        const filteredDataChunksReducerFunction = (
          filterGeneralName,
          filterExactName
        ) => {
          return chunk.map((item) =>
            item.reduce((acc, curr) => {
              const formatName = (x) => {
                return {
                  date: x["ARREST_DATE"],
                  [filterGeneralName]:
                    filterGeneralName === "category"
                      ? x[filterExactName] === "F"
                        ? "Felony"
                        : x[filterExactName] === "M"
                        ? "Misdemeanor"
                        : "Violation"
                      : filterGeneralName === "sex"
                      ? x[filterExactName] === "F"
                        ? "Female"
                        : "Male"
                      : x[filterExactName],
                };
              };

              const notNameMatchFilter = (x) =>
                x.date !== "ARREST_DATE" &&
                x[filterGeneralName] !== filterExactName;

              const newPushItem = formatName(curr);

              if (notNameMatchFilter(newPushItem)) {
                acc.push(newPushItem);
              }

              return acc;
            }, [])
          );
        };

        postMessage(
          JSON.stringify({
            age_group: filteredDataChunksReducerFunction(
              "age_group",
              "AGE_GROUP"
            ),
            borough: filteredDataChunksReducerFunction(
              "borough",
              "ARREST_BORO"
            ),
            category: filteredDataChunksReducerFunction(
              "category",
              "LAW_CAT_CD"
            ),
            sex: filteredDataChunksReducerFunction("sex", "PERP_SEX"),
            race: filteredDataChunksReducerFunction(
              "race",
              "PERP_RACE"
            ),
          })
        );
      }`;

      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob([response], { type: "application/javascript" })
      );

      const timelineWorker = new Worker(blobURL);

      changeTimelineWorkerInstance(timelineWorker);
    }
  }, [timelineWorkerInstance]);

  useEffect(() => {
    if (!setFilterAndTimelineGraphWorkersInstance) {
      const worker = new setFilterAndTimelineGraphWorkers();

      changeSetFilterAndTimelineGraphWorkersInstance(worker);
    }
  }, [setFilterAndTimelineGraphWorkersInstance]);

  useEffect(() => {
    if (!filterWorkerInstance) {
      const response = `self.onmessage = (e) => {
        const hasNumber = (input) => {
          return /[0-9]/.test(input); 
        };

        const dataSent = e.data;

        const ageGroup = dataSent.ageGroup;
        const raceArr = dataSent.raceArr;
        const boroughArr = dataSent.boroughArr;
        const offenseDescriptionArr = dataSent.offenseDescriptionArr;
        const filteredAgeGroup = dataSent.filteredAgeGroup;
        const filteredSexArr = dataSent.filteredSexArr;
        const filteredRaceArr = dataSent.filteredRaceArr;
        const filteredBoroughArr = dataSent.filteredBoroughArr;
        const filteredOffenseDescriptionArr =
          dataSent.filteredOffenseDescriptionArr;

        const uniqueValuesReducerFunction = (
          arrName,
          categoryName,
          arr
        ) =>
          arr
            ? [...new Set(arr)]
                .filter((x) => x !== categoryName)
                .sort((a, b) => {
                  if (
                    arrName === "filteredAgeGroupData" ||
                    arrName === "ageGroupData"
                  ) {
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
                  } else {
                    // Sort in increasing order
                    return a - b;
                  }
                })
            : [];

        postMessage(
          JSON.stringify({
            ageGroupData: uniqueValuesReducerFunction(
              "ageGroupData",
              "AGE_GROUP",
              ageGroup
            ),
            raceUniqueValues: uniqueValuesReducerFunction(
              "raceUniqueValues",
              "PERP_RACE",
              raceArr
            ),
            boroughUniqueValues: uniqueValuesReducerFunction(
              "boroughUniqueValues",
              "ARREST_BORO",
              boroughArr
            ),
            offenseDescriptionArr: uniqueValuesReducerFunction(
              "offenseDescriptionArr",
              "OFNS_DESC",
              offenseDescriptionArr
            ),
            filteredAgeGroupData: uniqueValuesReducerFunction(
              "filteredAgeGroupData",
              "AGE_GROUP",
              filteredAgeGroup
            ),
            filteredSexUniqueValues: uniqueValuesReducerFunction(
              "filteredSexUniqueValues",
              "PERP_SEX",
              filteredSexArr
            ),
            filteredRaceUniqueValues: uniqueValuesReducerFunction(
              "filteredRaceUniqueValues",
              "PERP_RACE",
              filteredRaceArr
            ),
            filteredBoroughUniqueValues: uniqueValuesReducerFunction(
              "filteredBoroughUniqueValues",
              "ARREST_BORO",
              filteredBoroughArr
            ),
            filteredOffenseDescriptionUniqueValues: uniqueValuesReducerFunction(
              "filteredOffenseDescriptionUniqueValues",
              "OFNS_DESC",
              filteredOffenseDescriptionArr
            ),
          })
        );
      };`;

      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob([response], { type: "application/javascript" })
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
              let ws = "";

              if (process.env.NODE_ENV === "production") {
                const host = "wss://nypd-arrest-map.herokuapp.com";

                ws = new WebSocket(host);
              } else {
                ws = new WebSocket("ws://localhost:4000");
              }

              onmessage = (e) => {
                const year = e.data;

                if (ws.readyState === 1) {
                  // Receive from main thread and send to websocket
                  ws.send(year);
                }

                ws.onopen = () => {
                  // Send one byte to websocket every 55 seconds to keep socket from closing itself on idle
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
      if (loadData.length === 0) {
        if (loadingYears.length === 0) {
          if (isMobileOrTablet) {
            if (isPortrait) {
              changeLoadingYears([2020]);
              dataFetch(2020, filteredDataChunks.length);
            }
          } else {
            changeLoadingYears([2020]);
            dataFetch(2020, filteredDataChunks.length);
          }
        }
      } else {
        if (loadingYears.length > 0 && loadData.length === 0) {
          dataFetch(loadingYears[0], filteredDataChunks.length);
          changeLoadingYears([]);
        }
      }
    }
  }, [
    workerInstance,
    dataFetch,
    loadingYears,
    filteredDataChunks.length,
    isPortrait,
    isMobileOrTablet,
    loadData.length,
    totalCount,
  ]);

  useEffect(() => {
    if (totalCount > 90000) {
      if (
        ageTimelineColumns &&
        boroughTimelineColumns &&
        categoryTimelineColumns &&
        raceTimelineColumns &&
        sexTimelineColumns
      ) {
        if (ageTimelineColumns.length > 0) {
          if (boroughTimelineColumns.length > 0) {
            if (categoryTimelineColumns.length > 0) {
              if (raceTimelineColumns.length > 0) {
                if (sexTimelineColumns.length > 0) {
                  if (!mapVisible) {
                    changeMapVisible(true);
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [
    totalCount,
    mapVisible,
    ageTimelineColumns,
    boroughTimelineColumns,
    categoryTimelineColumns,
    raceTimelineColumns,
    sexTimelineColumns,
  ]);

  return (
    <div>
      <div
        className="mobile_landscape_block"
        style={{
          display: isMobileOrTablet ? (isPortrait ? "none" : "flex") : "none",
        }}
      >
        <FcRotateToLandscape />
        <p>
          NYPD Arrest Map is available only for desktop mode or mobile portrait
          mode.
        </p>
      </div>
      {layersRef.current.length === 0 ||
      (ageTimelineColumns ? ageTimelineColumns.length === 0 : true) ||
      (boroughTimelineColumns ? boroughTimelineColumns.length === 0 : true) ||
      (categoryTimelineColumns ? categoryTimelineColumns.length === 0 : true) ||
      (raceTimelineColumns ? raceTimelineColumns.length === 0 : true) ||
      (sexTimelineColumns ? sexTimelineColumns.length === 0 : true) ? (
        <InitialLoader
          countUp={countUp}
          loaderColor={loaderColor}
          mapError={mapError}
          applyingFiltersProgressRef={applyingFiltersProgressRef}
        />
      ) : null}
      {modalActive.active && modalActive.year ? (
        <SubsequentLoader
          modalActive={modalActive}
          changeModalActive={changeModalActive}
        />
      ) : null}
      <Div100vh
        className="nypd_arrest_map_container"
        style={{
          opacity:
            layersRef.current.length === 0 ||
            (ageTimelineColumns ? ageTimelineColumns.length === 0 : true) ||
            (boroughTimelineColumns
              ? boroughTimelineColumns.length === 0
              : true) ||
            (categoryTimelineColumns
              ? categoryTimelineColumns.length === 0
              : true) ||
            (raceTimelineColumns ? raceTimelineColumns.length === 0 : true) ||
            (sexTimelineColumns ? sexTimelineColumns.length === 0 : true)
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
          changeLaddaLoading={changeLaddaLoading}
          laddaLoading={laddaLoading}
          resetLaddaLoading={resetLaddaLoading}
          changeResetLaddaLoading={changeResetLaddaLoading}
          menuClicked={menuClicked}
          changeMenuClicked={changeMenuClicked}
          collapseOpen={collapseOpen}
          changeCollapseOpen={changeCollapseOpen}
          layersRef={layersRef}
          footerMenuActive={footerMenuActive}
          isMobileOrTablet={isMobileOrTablet}
          isTablet={isTablet}
          currentFilters={currentFilters}
          isSame={isSame}
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
          ref={deckGLRef}
          layers={layersRef.current}
          pickingRadius={20}
          controller={true}
          onLoad={() => changeMapLoaded(true)}
          onError={() => changeMapError(true)}
          onHover={({ object, x, y }) => showTooltip(object, x, y)}
          useDevicePixels={false}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={token}
          />
        </DeckGL>
        {mapLoaded ? (
          <>
            <ApplyingFiltersPopUp
              applyingFiltersProgressRef={applyingFiltersProgressRef}
            />
            <BottomInfoPanel
              isSame={isSame}
              mapVisible={mapVisible}
              loadData={loadData}
              tooltipVisible={tooltipVisible}
              resetFilters={resetFilters}
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
              usePrevious={usePrevious}
              currentFilters={currentFilters}
              filteredTimelineAgeGroupData={filteredTimelineAgeGroupData}
              filteredTimelineBoroughData={filteredTimelineBoroughData}
              filteredTimelineCategoryData={filteredTimelineCategoryData}
              filteredTimelineSexData={filteredTimelineSexData}
              filteredTimelineRaceData={filteredTimelineRaceData}
              graphOption={graphOption}
              changeGraphOption={changeGraphOption}
              layersRef={layersRef}
              footerMenuActive={footerMenuActive}
              changeFooterMenuActive={changeFooterMenuActive}
              isMobileOrTablet={isMobileOrTablet}
              isMediumLaptop={isMediumLaptop}
              isTinyPhone={isTinyPhone}
            />
          </>
        ) : null}
      </Div100vh>
    </div>
  );
};

export default App;
