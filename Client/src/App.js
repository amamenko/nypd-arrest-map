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

  const [currentFilters, changeCurrentFilters] = useState({
    year: [],
    category: [],
    offense: [],
    age: [],
    race: [],
    sex: [],
    borough: [],
  });

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

  // Browser width on initial opening of app
  const [initialScreenWidth] = useState(window.innerWidth);
  // Current browser width if different from initial browser width
  const [currentScreenWidth, changeCurrentScreenWidth] = useState("");

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
      if (setFilterAndTimelineGraphWorkersInstance) {
        // Send from main thread to web worker
        setFilterAndTimelineGraphWorkersInstance.postMessage({
          arrName: arrName,
          generalName: generalName,
          arr: arr,
          unique: unique,
          dataArr: dataArr,
        });

        setFilterAndTimelineGraphWorkersInstance.onmessage = (receivedData) => {
          console.log("FILTER & TIMELINE WORKER FIRED");

          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;

          const arrayName = receivedData.data.arrayName;
          const returnedArr = receivedData.data.returnedArr;

          if (arrayName === "ageGroupTimelineGraphData") {
            dispatch(ACTION_TIMELINE_AGE_GROUP_GRAPH_DATA(returnedArr));
          } else if (arrayName === "boroughTimelineGraphData") {
            dispatch(ACTION_TIMELINE_BOROUGH_GRAPH_DATA(returnedArr));
          } else if (arrayName === "categoryTimelineGraphData") {
            if (
              !isSame(categoryTimelineGraphData, returnedArr) &&
              returnedArr.length > 0
            ) {
              dispatch(ACTION_TIMELINE_CATEGORY_GRAPH_DATA(returnedArr));
            }
          } else if (arrayName === "genderTimelineGraphData") {
            dispatch(ACTION_TIMELINE_GENDER_GRAPH_DATA(returnedArr));
          } else {
            dispatch(ACTION_TIMELINE_RACE_GRAPH_DATA(returnedArr));
          }
        };
      }
    },
    [
      setFilterAndTimelineGraphWorkersInstance,
      dispatch,
      categoryTimelineGraphData,
    ]
  );

  const postToFilteredWorker = useCallback(
    (arrName, arr) => {
      if (filterWorkerInstance) {
        // Send from main thread to web worker
        filterWorkerInstance.postMessage({ arrName: arrName, arr: arr });

        filterWorkerInstance.onmessage = (receivedData) => {
          console.log("FILTERED WORKER FIRED");

          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;

          const parsedData = JSON.parse(receivedData.data);

          const arrayName = parsedData.arrayName;
          const returnedArr = parsedData.returnedArr;

          if (arrayName === "filteredAgeGroupData") {
            changeFilteredAgeGroupData(returnedArr);
          } else if (arrayName === "filteredRaceUniqueValues") {
            changeFilteredRaceUniqueValues(returnedArr);
          } else if (arrayName === "filteredSexUniqueValues") {
            changeFilteredSexUniqueValues(returnedArr);
          } else if (arrayName === "filteredBoroughUniqueValues") {
            changeFilteredBoroughUniqueValues(returnedArr);
          } else if (arrayName === "filteredOffenseDescriptionUniqueValues") {
            changeFilteredOffenseDescriptionUniqueValues(returnedArr);
            changeReadyForTimelineColumnPosts(true);
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
    [filterWorkerInstance]
  );

  const postToMapFilterWorker = useCallback(
    (chunk, arrName, specificName, filterArr) => {
      if (mapFilterWorkerInstance) {
        // Send from main thread to web worker
        mapFilterWorkerInstance.postMessage({
          chunk: chunk,
          arrName: arrName,
          filterExactName: specificName,
          filterArr: filterArr,
        });

        mapFilterWorkerInstance.onmessage = (receivedData) => {
          console.log("MAP WORKER FIRED");

          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;

          const parsedData = JSON.parse(receivedData.data);

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
          } else {
            changeFilteredUniqueDates(returnedArr);
          }
        };
      }
    },
    [mapFilterWorkerInstance, postToFilteredWorker]
  );

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
          console.log("TIMELINE WORKER FIRED");

          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;
          applyingFiltersProgressRef.current++;

          const parsedData = JSON.parse(receivedData.data);

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
    if (readyForTimelineColumnPosts) {
      changeReadyForTimelineColumnPosts(false);

      postToTimelineGraphWorker(
        "ageGroupTimelineGraphData",
        "age_group",
        filteredUniqueDates,
        filteredAgeGroupData,
        filteredTimelineAgeGroupData
      );

      postToTimelineGraphWorker(
        "raceTimelineGraphData",
        "race",
        filteredUniqueDates,
        filteredRaceUniqueValues,
        filteredTimelineRaceData
      );

      postToTimelineGraphWorker(
        "categoryTimelineGraphData",
        "category",
        filteredUniqueDates,
        filteredUniqueCategory,
        filteredTimelineCategoryData
      );

      postToTimelineGraphWorker(
        "genderTimelineGraphData",
        "sex",
        filteredUniqueDates,
        filteredSexUniqueValues,
        filteredTimelineSexData
      );

      postToTimelineGraphWorker(
        "boroughTimelineGraphData",
        "borough",
        filteredUniqueDates,
        filteredBoroughUniqueValues,
        filteredTimelineBoroughData
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
    filteredUniqueDates,
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

    if (loadDataChunks && prevLoadChunks) {
      if (
        !isSame(
          Object.values(loadDataChunks[0]),
          Object.values(prevLoadChunks[0])
        )
      ) {
        if (totalCount === expectedTotal) {
          dispatch(
            ACTION_ASSIGN_FILTERED_DATA(
              Object.values(loadDataChunks[0]).flat().flat()
            )
          );

          dispatch(ACTION_FILTERED_DATA_CHANGED());
        }
      }
    }
  }, [
    loadData,
    dispatch,
    loadDataChunks,
    loadedYears,
    prevLoadChunks,
    totalCount,
    filteredData.length,
    filteredDataChanged,
  ]);

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

          postToMapFilterWorker(loadData, "ageGroup", "AGE_GROUP");
          postToMapFilterWorker(loadData, "raceArr", "PERP_RACE");
          postToMapFilterWorker(loadData, "boroughArr", "ARREST_BORO");
          postToMapFilterWorker(loadData, "offenseDescriptionArr", "OFNS_DESC");

          postToMapFilterWorker(
            filteredData,
            "filteredArrestCategory",
            "LAW_CAT_CD",
            currentFilters.category
          );
          postToMapFilterWorker(
            filteredData,
            "filteredAgeGroup",
            "AGE_GROUP",
            currentFilters.age
          );
          postToMapFilterWorker(
            filteredData,
            "filteredSexArr",
            "PERP_SEX",
            currentFilters.sex
          );
          postToMapFilterWorker(
            filteredData,
            "filteredRaceArr",
            "PERP_RACE",
            currentFilters.race
          );
          postToMapFilterWorker(
            filteredData,
            "filteredBoroughArr",
            "ARREST_BORO",
            currentFilters.borough
          );
          postToMapFilterWorker(
            filteredData,
            "filteredOffenseDescriptionArr",
            "OFNS_DESC",
            currentFilters.offense
          );

          postToMapFilterWorker(
            filteredDataChunks,
            "filteredUniqueCategory",
            "LAW_CAT_CD",
            currentFilters.category
          );

          postToMapFilterWorker(
            filteredDataChunks,
            "filteredUniqueDates",
            "ARREST_DATE",
            currentFilters.year
          );

          postToTimelineWorker(filteredDataChunks, "age_group", "AGE_GROUP");
          postToTimelineWorker(filteredDataChunks, "borough", "ARREST_BORO");
          postToTimelineWorker(filteredDataChunks, "category", "LAW_CAT_CD");
          postToTimelineWorker(filteredDataChunks, "sex", "PERP_SEX");
          postToTimelineWorker(filteredDataChunks, "race", "PERP_RACE");

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
    filteredUniqueDates,
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

          dispatch(ACTION_APPLYING_FILTERS_RESET());
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
    (chunk, dataIndex, firstMessage) => {
      const chunkYear = chunk.year;

      // Year does not exist, create new year and add data
      if (firstMessage) {
        dispatch(ACTION_LOAD_DATA_CHUNKS_ADD_YEAR(chunk.data, chunkYear));

        dispatch(ACTION_FILTERED_DATA_CHUNKS_ADD_YEAR(chunk.data));

        dispatch(ACTION_ASSIGN_LOAD_DATA(chunk.data));
      } else {
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

          dispatch(ACTION_INCREMENT_TOTAL_COUNT(chunkArr.length));

          onNewDataArrive(
            {
              year: data.year,
              data: chunkArr,
            },
            dataIndex,
            firstMessage
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

      changeCollapseOpen("");
      changeMenuClicked(false);

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

    dispatch(ACTION_CHANGE_YEAR_FILTER(newYearArr));
    dispatch(ACTION_CHANGE_CATEGORY_FILTER([]));
    dispatch(ACTION_CHANGE_OFFENSE_FILTER([]));
    dispatch(ACTION_CHANGE_RACE_FILTER([]));
    dispatch(ACTION_CHANGE_AGE_FILTER([]));
    dispatch(ACTION_CHANGE_SEX_FILTER([]));
    dispatch(ACTION_CHANGE_BOROUGH_FILTER([]));

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
                const dataSent = e.data;

                const splitChunks = dataSent.chunk;
                const chunk = dataSent.chunk.flat();
                const arrName = dataSent.arrName;
                const filterExactName = dataSent.filterExactName;
                const filterArr = dataSent.filterArr;

                if (arrName === "filteredUniqueDates") {
                  const yearsArr = splitChunks.map((x) => {
                    const date = x[5][filterExactName];

                    return Number(date.substring(date.length - 4, date.length));
                  });

                  const filterArrIncluded = (item, index) => {
                    if (item !== filterExactName) {
                      if (filterArr.length > 0) {
                        if (filterArr.includes(yearsArr[index])) {
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
                  };

                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: splitChunks
                        .map((x, i) => [
                          ...new Set(
                            x.reduce((acc, curr) => {
                              const exactName = curr[filterExactName];

                              if (filterArrIncluded(exactName, i)) {
                                acc.push(exactName);
                              }

                              return acc;
                            }, [])
                          ),
                        ])
                        .flat(),
                    })
                  );
                } else if (arrName === "filteredUniqueCategory") {
                  const filterArrIncluded = (item) =>
                    item !== filterExactName &&
                    (filterArr.length > 0 ? filterArr.includes(item) : true);

                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: [
                        ...new Set(
                          chunk.reduce((acc, curr) => {
                            const exactName = curr[filterExactName];

                            if (filterArrIncluded(exactName)) {
                              acc.push(exactName);
                            }

                            return acc;
                          }, [])
                        ),
                      ],
                    })
                  );
                } else if (
                  arrName.includes("filtered") &&
                  arrName !== "filteredBoroughArr" &&
                  arrName !== "filteredOffenseDescriptionArr"
                ) {
                  const filterArrIncluded = (item) =>
                    item !== filterExactName &&
                    (filterArr.length > 0 ? filterArr.includes(item) : true);

                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk.reduce((acc, curr) => {
                        const exactName = curr[filterExactName];

                        if (filterArrIncluded(exactName)) {
                          acc.push(exactName);
                        }

                        return acc;
                      }, []),
                    })
                  );
                } else if (
                  arrName === "boroughArr" ||
                  arrName === "filteredBoroughArr"
                ) {
                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk.reduce((acc, curr) => {
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

                        const filterArrIncluded = (x) => {
                          if (x !== filterExactName) {
                            if (filterArr) {
                              if (filterArr.length > 0) {
                                return filterArr.includes(x);
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

                        const currentPushItem = currentName(curr);

                        if (filterArrIncluded(currentPushItem)) {
                          acc.push(currentPushItem);
                        }

                        return acc;
                      }, []),
                    })
                  );
                } else if (
                  arrName === "offenseDescriptionArr" ||
                  arrName === "filteredOffenseDescriptionArr"
                ) {
                  const filterArrIncluded = (x) => {
                    if (filterArr) {
                      if (filterArr.length > 0) {
                        return filterArr.includes(x);
                      } else {
                        return true;
                      }
                    } else {
                      return true;
                    }
                  };

                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk.reduce((acc, curr) => {
                        const exactName =
                          curr[filterExactName] !== "OFNS_DESC" &&
                          curr[filterExactName];

                        if (filterArrIncluded(exactName)) {
                          acc.push(exactName);
                        }

                        return acc;
                      }, []),
                    })
                  );
                } else {
                  const filterArrIncluded = (x) => {
                    if (x !== filterExactName) {
                      if (filterArr) {
                        if (filterArr.length > 0) {
                          return filterArr.includes(x);
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

                  postMessage(
                    JSON.stringify({
                      arrayName: arrName,
                      returnedArr: chunk.reduce((acc, curr) => {
                        const exactName = curr[filterExactName];

                        if (filterArrIncluded(exactName)) {
                          acc.push(exactName);
                        }

                        return acc;
                      }, []),
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
                        item.reduce((acc, curr) => {
                          const formatName = (x) => {
                            return {
                              date: x["ARREST_DATE"],
                              [filterGeneralName]:
                                x[filterExactName] === "F"
                                  ? "Felony"
                                  : x[filterExactName] === "M"
                                  ? "Misdemeanor"
                                  : "Violation",
                            };
                          };

                          const filterArrIncluded = (x) =>
                            x.date !== "ARREST_DATE" &&
                            x[filterGeneralName] !== filterExactName;

                          const newPushItem = formatName(curr);

                          if (filterArrIncluded(newPushItem)) {
                            acc.push(newPushItem);
                          }

                          return acc;
                        }, [])
                      ),
                    })
                  );
                } else if (filterGeneralName === "sex") {
                  postMessage(
                    JSON.stringify({
                      arrayName: filterGeneralName,
                      returnedArr: chunk.map((item) =>
                        item.reduce((acc, curr) => {
                          const formatName = (x) => {
                            return {
                              date: x["ARREST_DATE"],
                              [filterGeneralName]:
                                x[filterExactName] === "F" ? "Female" : "Male",
                            };
                          };

                          const filterArrIncluded = (x) =>
                            x.date !== "ARREST_DATE" &&
                            x[filterGeneralName] !== filterExactName;

                          const newPushItem = formatName(curr);

                          if (filterArrIncluded(newPushItem)) {
                            acc.push(newPushItem);
                          }

                          return acc;
                        }, [])
                      ),
                    })
                  );
                } else {
                  postMessage(
                    JSON.stringify({
                      arrayName: filterGeneralName,
                      returnedArr: chunk.map((item) => {
                        if (item instanceof Array) {
                          return item.reduce((acc, curr) => {
                            const formatName = (x) => {
                              return {
                                date: x["ARREST_DATE"],
                                [filterGeneralName]: x[filterExactName],
                              };
                            };

                            const filterArrIncluded = (x) =>
                              x.date !== "ARREST_DATE" &&
                              x[filterGeneralName] !== filterExactName;

                            const newPushItem = formatName(curr);

                            if (filterArrIncluded(newPushItem)) {
                              acc.push(newPushItem);
                            }

                            return acc;
                          }, []);
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
                        ? [...new Set(arr)].sort((a, b) => {
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
                      returnedArr: arr ? [...new Set(arr)].sort() : [],
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

  return (
    <>
      {totalCount < 70000 ||
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
          loadedYears={loadedYears}
        />
      ) : null}
      <div
        className="nypd_arrest_map_container"
        style={{
          opacity:
            totalCount < 70000 ||
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
          initialScreenWidth={initialScreenWidth}
          currentScreenWidth={currentScreenWidth}
          loadedYears={loadedYears}
          pointClicked={tooltipVisible}
          changeLaddaLoading={changeLaddaLoading}
          laddaLoading={laddaLoading}
          handleDownloadYear={handleDownloadYear}
          menuClicked={menuClicked}
          changeMenuClicked={changeMenuClicked}
          collapseOpen={collapseOpen}
          changeCollapseOpen={changeCollapseOpen}
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
              filteredUniqueDates={filteredUniqueDates}
              filteredTimelineAgeGroupData={filteredTimelineAgeGroupData}
              filteredTimelineBoroughData={filteredTimelineBoroughData}
              filteredTimelineCategoryData={filteredTimelineCategoryData}
              filteredTimelineSexData={filteredTimelineSexData}
              filteredTimelineRaceData={filteredTimelineRaceData}
            />
          </>
        ) : null}
      </div>
    </>
  );
};

export default App;
