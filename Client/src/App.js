import React, { useCallback, useEffect, useRef, useState } from "react";
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
import ACTION_ASSIGN_LOAD_DATA from "./actions/loadData/ACTION_ASSIGN_LOAD_DATA";
import ACTION_ASSIGN_FILTERED_DATA from "./actions/filteredData/ACTION_ASSIGN_FILTERED_DATA";
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
import ACTION_CHANGE_YEAR_FILTER from "./actions/filters/year/ACTION_CHANGE_YEAR_FILTER";
import ACTION_CHANGE_CATEGORY_FILTER from "./actions/filters/category/ACTION_CHANGE_CATEGORY_FILTER";
import ACTION_CHANGE_OFFENSE_FILTER from "./actions/filters/offense/ACTION_CHANGE_OFFENSE_FILTER";
import ACTION_CHANGE_RACE_FILTER from "./actions/filters/race/ACTION_CHANGE_RACE_FILTER";
import ACTION_CHANGE_AGE_FILTER from "./actions/filters/age/ACTION_CHANGE_AGE_FILTER";
import ACTION_CHANGE_SEX_FILTER from "./actions/filters/sex/ACTION_CHANGE_SEX_FILTER";
import ACTION_CHANGE_BOROUGH_FILTER from "./actions/filters/borough/ACTION_CHANGE_BOROUGH_FILTER";
import ACTION_APPLYING_FILTERS from "./actions/applyingFilters/ACTION_APPLYING_FILTERS";
import ACTION_APPLYING_FILTERS_RESET from "./actions/applyingFilters/ACTION_APPLYING_FILTERS_RESET";
import ApplyingFiltersPopUp from "./ApplyingFiltersPopUp/ApplyingFiltersPopUp";
import ACTION_NEW_YEAR_FINISHED_LOADING_RESET from "./actions/newYearFinishedLoading/ACTION_NEW_YEAR_FINISHED_LOADING_RESET";
import ACTION_NEW_YEAR_FINISHED_LOADING from "./actions/newYearFinishedLoading/ACTION_NEW_YEAR_FINISHED_LOADING";
import ACTION_TRENDS_AVAILABLE from "./actions/trendsAvailable/ACTION_TRENDS_AVAILABLE";
import ACTION_TRENDS_NOT_AVAILABLE from "./actions/trendsAvailable/ACTION_TRENDS_NOT_AVAILABLE";
import Div100vh from "react-div-100vh";
import { useMediaQuery } from "react-responsive";

dayjs.extend(customParseFormat);

const App = () => {
  const dispatch = useDispatch();

  const loadData = useSelector((state) => state.loadDataReducer.data);
  const filteredData = useSelector((state) => state.filteredDataReducer.data);
  const filteredDataChanged = useSelector(
    (state) => state.filteredDataReducer.changed
  );
  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );
  const newYearFinishedLoading = useSelector(
    (state) => state.newYearFinishedLoadingReducer.finished
  );

  const loadDataChunks = useSelector(
    (state) => state.loadDataChunksReducer.data
  );
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
    year: [],
    category: [],
    offense: [],
    age: [],
    race: [],
    sex: [],
    borough: [],
  });

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktopLaptopOrTablet = useMediaQuery({ minWidth: 768 });

  const [laddaLoading, changeLaddaLoading] = useState(false);
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

  const loadedYears = loadDataChunks[0]
    ? Object.keys(loadDataChunks[0]).map((x) => Number(x))
    : [];

  const { countUp, update } = useCountUp({
    start: 0,
    end: loadDataChunks[0]
      ? loadDataChunks[0]["2020"]
        ? Number(
            (
              loadDataChunks[0]["2020"]
                .map((x) => x.length)
                .reduce((a, b) => a + b, 0) / yearlyTotals["2020"]
            ).toFixed(1)
          ) * 100
        : 0
      : 0,
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    if (loadDataChunks[0]) {
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
    }
  }, [update, countUp, loadDataChunks]);

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
          console.log("FILTER & TIMELINE WORKER FIRED");

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
          console.log("FILTERED WORKER FIRED");

          applyingFiltersProgressRef.current += 34;

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
          dispatch(ACTION_APPLYING_FILTERS_RESET());
        };
      }
    },
    [filterWorkerInstance, dispatch]
  );

  const postToMapFilterWorker = useCallback(
    (loadData, filteredData, filteredDataChunks, currentFilters) => {
      if (mapFilterWorkerInstance) {
        // Send from main thread to web worker
        mapFilterWorkerInstance.postMessage({
          loadData,
          filteredData,
          filteredDataChunks,
          currentFilters,
        });

        mapFilterWorkerInstance.onmessage = (receivedData) => {
          console.log("MAP WORKER FIRED");

          applyingFiltersProgressRef.current += 33;

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
          console.log("TIMELINE WORKER FIRED");

          applyingFiltersProgressRef.current += 33;

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
    const expectedTotal = loadedYears
      .map((x) => yearlyTotals[x])
      .reduce((a, b) => a + b, 0);

    if (newYearFinishedLoading) {
      dispatch(ACTION_NEW_YEAR_FINISHED_LOADING_RESET());
      if (totalCount === expectedTotal && loadData.length === expectedTotal) {
        if (loadedYears.length === 1) {
          dispatch(ACTION_ASSIGN_FILTERED_DATA(loadData));
        } else {
          dispatch(ACTION_ASSIGN_FILTERED_DATA("loadData"));
        }

        dispatch(ACTION_FILTERED_DATA_CHANGED());
      }
    }
  }, [newYearFinishedLoading, loadData, dispatch, loadedYears, totalCount]);

  useEffect(() => {
    if (!filteredDataChanged) {
      if (mapPostsCompleted) {
        changeMapPostsCompleted(false);
      }
    }
  }, [filteredDataChanged, mapPostsCompleted]);

  useEffect(() => {
    const expectedTotal = loadedYears
      .map((x) => yearlyTotals[x])
      .reduce((a, b) => a + b, 0);

    if (totalCount > 0 && totalCount === expectedTotal) {
      if (filteredDataChanged) {
        if (!mapPostsCompleted) {
          console.log("THIS IS RUNNING RIGHT HERE THIS PART");
          renderLayers();

          postToMapFilterWorker(
            loadData,
            filteredData,
            filteredDataChunks,
            currentFilters
          );
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
    loadedYears,
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
                  filteredAgeGroupData.map((item) =>
                    item === "65" ? "65+" : item
                  )
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
      const chunkYear = chunk.year;

      // Year does not exist, create new year and add data
      if (firstMessage) {
        dispatch(ACTION_LOAD_DATA_CHUNKS_ADD_YEAR(chunk.data, chunkYear));

        dispatch(ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR(chunk.data));

        dispatch(ACTION_ASSIGN_LOAD_DATA(chunk.data));
      } else {
        if (lastMessage) {
          dispatch(ACTION_NEW_YEAR_FINISHED_LOADING());
        }

        // Year exists, add additional data to it
        dispatch(ACTION_LOAD_DATA_CHUNKS_ADD_TO_YEAR(chunk.data, chunkYear));

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
    year,
    category,
    offense,
    age,
    race,
    sex,
    borough,
    suppliedData,
    downloadYear
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
        year: year,
        category: category,
        offense: offense,
        age: age,
        race: race,
        sex: sex,
        borough: borough,
        suppliedData: suppliedData,
      });

      if (!downloadYear) {
        dispatch(ACTION_APPLYING_FILTERS());
      }

      setFilterAndTimelineGraphWorkersInstance.onmessage = (receivedData) => {
        const assignFilteredData = receivedData.data.assignFilteredData;
        const assignFilteredDataFlat = receivedData.data.assignFilteredDataFlat;

        if (assignFilteredData && assignFilteredDataFlat) {
          dispatch(ACTION_ASSIGN_FILTERED_DATA_CHUNKS(assignFilteredData));

          dispatch(ACTION_ASSIGN_FILTERED_DATA(assignFilteredDataFlat));

          changeCurrentFilters({
            year: year,
            category: category,
            offense: offense,
            age: age,
            race: race,
            sex: sex,
            borough: borough,
          });

          if (!downloadYear) {
            dispatch(ACTION_FILTERED_DATA_CHANGED());
          }
        }
      };

      setTimeout(() => changeLaddaLoading(false), 1000);
    }
  };

  useEffect(() => {
    if (currentFilters && prevFilters) {
      if (!isSame(Object.values(currentFilters), Object.values(prevFilters))) {
        renderLayers();
      }
    }
  }, [currentFilters, prevFilters, renderLayers, dispatch, filteredDataChunks]);

  const handleDownloadYear = (year) => {
    const newYearArr = [...loadedYears, year];

    if (graphOption === "trends") {
      changeGraphOption("overview");
    }

    dispatch(ACTION_CHANGE_YEAR_FILTER(newYearArr));
    dispatch(ACTION_CHANGE_CATEGORY_FILTER([]));
    dispatch(ACTION_CHANGE_OFFENSE_FILTER([]));
    dispatch(ACTION_CHANGE_RACE_FILTER([]));
    dispatch(ACTION_CHANGE_AGE_FILTER([]));
    dispatch(ACTION_CHANGE_SEX_FILTER([]));
    dispatch(ACTION_CHANGE_BOROUGH_FILTER([]));
    dispatch(ACTION_TRENDS_NOT_AVAILABLE());

    setFilters(newYearArr, [], [], [], [], [], [], loadData, true);
    changeModalActive({ active: true, year: year });
    changeLoadingYears([year]);
    changeCollapseOpen("");
    changeMenuClicked(false);
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
                const t0 = performance.now();
                const dataSent = e.data;

                const loadData = dataSent.loadData;
                const filteredData = dataSent.filteredData;
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
                      filteredData,
                      "LAW_CAT_CD",
                      "category"
                    ),
                    filteredAgeGroup: dataReducerFunction(
                      filteredData,
                      "AGE_GROUP",
                      "age"
                    ),
                    filteredSexArr: dataReducerFunction(
                      filteredData,
                      "PERP_SEX",
                      "sex"
                    ),
                    filteredRaceArr: dataReducerFunction(
                      filteredData,
                      "PERP_RACE",
                      "race"
                    ),
                    filteredBoroughArr: boroughLoadDataReducerFunction(
                      filteredData,
                      "ARREST_BORO",
                      "borough"
                    ),
                    filteredOffenseDescriptionArr: dataReducerFunction(
                      filteredData,
                      "OFNS_DESC",
                      "offense"
                    ),
                    filteredUniqueCategory: filteredDataChunksReducerFunction(
                      "LAW_CAT_CD",
                      "category"
                    ),
                  })
                );

                const t1 = performance.now();

                console.log(
                  `Map worker performance is ${t1 - t0} milliseconds.`
                );
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
                const t0 = performance.now();
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
                const t1 = performance.now();

                console.log(
                  `Timeline worker performance is ${t1 - t0} milliseconds.`
                );
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
    if (!setFilterAndTimelineGraphWorkersInstance) {
      const worker = new setFilterAndTimelineGraphWorkers();

      changeSetFilterAndTimelineGraphWorkersInstance(worker);
    }
  }, [setFilterAndTimelineGraphWorkersInstance]);

  useEffect(() => {
    if (!filterWorkerInstance) {
      // Creates inline web worker from anonymous function
      const blobURL = URL.createObjectURL(
        new Blob(
          [
            "(",
            (() => {
              onmessage = (e) => {
                const t0 = performance.now();
                const hasNumber = (input) => {
                  return /\d/.test(input);
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

                const t1 = performance.now();

                console.log(
                  `Filter worker performance is ${t1 - t0} milliseconds.`
                );
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
    if (totalCount > 70000) {
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

  const handlePinchZoom = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  return (
    <div onTouchMove={handlePinchZoom}>
      {layersRef.current.length === 0 ||
      filteredAgeGroupData.length === 0 ||
      filteredBoroughUniqueValues.length === 0 ||
      filteredArrestCategory.length === 0 ||
      filteredSexUniqueValues.length === 0 ||
      filteredRaceUniqueValues.length === 0 ? (
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
          loadedYears={loadedYears}
        />
      ) : null}
      <Div100vh
        className="nypd_arrest_map_container"
        style={{
          opacity:
            layersRef.current.length === 0 ||
            filteredAgeGroupData.length === 0 ||
            filteredBoroughUniqueValues.length === 0 ||
            filteredArrestCategory.length === 0 ||
            filteredSexUniqueValues.length === 0 ||
            filteredRaceUniqueValues.length === 0
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
          loadedYears={loadedYears}
          changeLaddaLoading={changeLaddaLoading}
          laddaLoading={laddaLoading}
          handleDownloadYear={handleDownloadYear}
          menuClicked={menuClicked}
          changeMenuClicked={changeMenuClicked}
          collapseOpen={collapseOpen}
          changeCollapseOpen={changeCollapseOpen}
          layersRef={layersRef}
          filteredAgeGroupData={filteredAgeGroupData}
          filteredBoroughUniqueValues={filteredBoroughUniqueValues}
          filteredArrestCategory={filteredArrestCategory}
          filteredSexUniqueValues={filteredSexUniqueValues}
          filteredRaceUniqueValues={filteredRaceUniqueValues}
          footerMenuActive={footerMenuActive}
          isMobile={isMobile}
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
          onError={() => changeMapError(true)}
          onHover={({ object, x, y }) => showTooltip(object, x, y)}
          onClick={({ object, x, y }) => showTooltip(object, x, y)}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/dark-v9"
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
              isMobile={isMobile}
              isDesktopLaptopOrTablet={isDesktopLaptopOrTablet}
            />
          </>
        ) : null}
      </Div100vh>
    </div>
  );
};

export default App;
