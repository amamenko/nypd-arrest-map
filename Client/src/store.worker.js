import { createStore, combineReducers } from "redux";
import { exposeStore } from "redux-in-worker";

const initialState = {
  loadDataReducer: {
    data: [],
  },
  filteredDataReducer: {
    changed: false,
  },
  filteredDataChunksReducer: {
    data: [],
  },
  newYearFinishedLoadingReducer: { finished: false },
  ageFilterReducer: {
    age: [],
  },
  boroughFilterReducer: { borough: [] },
  categoryFilterReducer: { category: [] },
  offenseFilterReducer: { offense: [] },
  raceFilterReducer: { race: [] },
  sexFilterReducer: { sex: [] },
  yearFilterReducer: { year: [] },
  ageTimelineColumnReducer: { columns: [] },
  boroughTimelineColumnsReducer: { columns: [] },
  categoryTimelineColumnsReducer: { columns: [] },
  raceTimelineColumnsReducer: { columns: [] },
  sexTimelineColumnsReducer: { columns: [] },
  ageGroupTimelineGraphDataReducer: { data: [] },
  boroughTimelineGraphDataReducer: { data: [] },
  categoryTimelineGraphDataReducer: { data: [] },
  genderTimelineGraphDataReducer: { data: [] },
  raceTimelineGraphDataReducer: { data: [] },
  totalCountReducer: { total: 0 },
  applyingFiltersReducer: { filters: false },
  applyingFiltersProgressReducer: { progress: 0 },
  trendsAvailableReducer: { available: false },
};

const currentState = {
  loadDataReducer: {
    data: [],
  },
};

const ASSIGN_LOAD_DATA = "ASSIGN_LOAD_DATA";

const loadDataReducer = (state = initialState.loadDataReducer, action) => {
  switch (action.type) {
    case ASSIGN_LOAD_DATA:
      let newConcatState = Object.assign([], state.data);
      newConcatState = newConcatState.concat(action.data);

      currentState.loadDataReducer.data = newConcatState;

      return {
        ...state,
        data: newConcatState,
      };
    default:
      return { ...state };
  }
};

const FILTERED_DATA_CHANGED = "FILTERED_DATA_CHANGED";
const FILTERED_DATA_CHANGED_RESET = "FILTERED_DATA_CHANGED_RESET";

const filteredDataReducer = (
  state = initialState.filteredDataReducer,
  action
) => {
  switch (action.type) {
    case FILTERED_DATA_CHANGED:
      return {
        ...state,
        changed: true,
      };
    case FILTERED_DATA_CHANGED_RESET:
      return {
        ...state,
        changed: false,
      };
    default:
      return { ...state };
  }
};

const FILTERED_DATA_CHUNKS_ADD_YEAR = "FILTERED_DATA_CHUNKS_ADD_YEAR";
const FILTERED_DATA_CHUNKS_ADD_TO_YEAR = "FILTERED_DATA_CHUNKS_ADD_TO_YEAR";
const ASSIGN_FILTERED_DATA_CHUNKS = "ASSIGN_FILTERED_DATA_CHUNKS";

const filteredDataChunksReducer = (
  state = initialState.filteredDataChunksReducer,
  action
) => {
  switch (action.type) {
    case FILTERED_DATA_CHUNKS_ADD_YEAR:
      const newPushState = Object.assign([], state.data);
      newPushState.push(action.data);

      return { ...state, data: newPushState };

    case FILTERED_DATA_CHUNKS_ADD_TO_YEAR:
      const newConcatState = Object.assign([], state.data);
      if (newConcatState[action.dataIndex]) {
        newConcatState[action.dataIndex] = newConcatState[
          action.dataIndex
        ].concat(action.data);
      }

      return {
        ...state,
        data: newConcatState,
      };
    case ASSIGN_FILTERED_DATA_CHUNKS:
      return { ...state, data: action.data };
    default:
      return { ...state };
  }
};

const CHANGE_AGE_FILTER = "CHANGE_AGE_FILTER";

const ageFilterReducer = (state = initialState.ageFilterReducer, action) => {
  switch (action.type) {
    case CHANGE_AGE_FILTER:
      return {
        ...state,
        age: action.age,
      };
    default:
      return { ...state };
  }
};

const CHANGE_BOROUGH_FILTER = "CHANGE_BOROUGH_FILTER";

const boroughFilterReducer = (
  state = initialState.boroughFilterReducer,
  action
) => {
  switch (action.type) {
    case CHANGE_BOROUGH_FILTER:
      return {
        ...state,
        borough: action.borough,
      };
    default:
      return { ...state };
  }
};

const CHANGE_CATEGORY_FILTER = "CHANGE_CATEGORY_FILTER";

const categoryFilterReducer = (
  state = initialState.categoryFilterReducer,
  action
) => {
  switch (action.type) {
    case CHANGE_CATEGORY_FILTER:
      return {
        ...state,
        category: action.category,
      };
    default:
      return { ...state };
  }
};

const CHANGE_OFFENSE_FILTER = "CHANGE_OFFENSE_FILTER";

const offenseFilterReducer = (
  state = initialState.offenseFilterReducer,
  action
) => {
  switch (action.type) {
    case CHANGE_OFFENSE_FILTER:
      return {
        ...state,
        offense: action.offense,
      };
    default:
      return { ...state };
  }
};

const CHANGE_RACE_FILTER = "CHANGE_RACE_FILTER";

const raceFilterReducer = (state = initialState.raceFilterReducer, action) => {
  switch (action.type) {
    case CHANGE_RACE_FILTER:
      return {
        ...state,
        race: action.race,
      };
    default:
      return { ...state };
  }
};

const CHANGE_SEX_FILTER = "CHANGE_SEX_FILTER";

const sexFilterReducer = (state = initialState.sexFilterReducer, action) => {
  switch (action.type) {
    case CHANGE_SEX_FILTER:
      return {
        ...state,
        sex: action.sex,
      };
    default:
      return { ...state };
  }
};

const CHANGE_YEAR_FILTER = "CHANGE_YEAR_FILTER";

const yearFilterReducer = (state = initialState.yearFilterReducer, action) => {
  switch (action.type) {
    case CHANGE_YEAR_FILTER:
      return {
        ...state,
        year: action.year,
      };
    default:
      return { ...state };
  }
};

const AGE_TIMELINE_COLUMNS = "AGE_TIMELINE_COLUMNS";

const ageTimelineColumnsReducer = (
  state = initialState.ageTimelineColumnsReducer,
  action
) => {
  switch (action.type) {
    case AGE_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

const BOROUGH_TIMELINE_COLUMNS = "BOROUGH_TIMELINE_COLUMNS";

const boroughTimelineColumnsReducer = (
  state = initialState.boroughTimelineColumnsReducer,
  action
) => {
  switch (action.type) {
    case BOROUGH_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

const CATEGORY_TIMELINE_COLUMNS = "CATEGORY_TIMELINE_COLUMNS";

const categoryTimelineColumnsReducer = (
  state = initialState.categoryTimelineColumnsReducer,
  action
) => {
  switch (action.type) {
    case CATEGORY_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

const RACE_TIMELINE_COLUMNS = "RACE_TIMELINE_COLUMNS";

const raceTimelineColumnsReducer = (
  state = initialState.raceTimelineColumnsReducer,
  action
) => {
  switch (action.type) {
    case RACE_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

const SEX_TIMELINE_COLUMNS = "SEX_TIMELINE_COLUMNS";

const sexTimelineColumnsReducer = (
  state = initialState.sexTimelineColumnsReducer,
  action
) => {
  switch (action.type) {
    case SEX_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

const TIMELINE_AGE_GROUP_GRAPH_DATA = "TIMELINE_AGE_GROUP_GRAPH_DATA";

const ageGroupTimelineGraphDataReducer = (
  state = initialState.ageGroupTimelineGraphDataReducer,
  action
) => {
  switch (action.type) {
    case TIMELINE_AGE_GROUP_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

const TIMELINE_BOROUGH_GRAPH_DATA = "TIMELINE_BOROUGH_GRAPH_DATA";

const boroughTimelineGraphDataReducer = (
  state = initialState.boroughTimelineGraphDataReducer,
  action
) => {
  switch (action.type) {
    case TIMELINE_BOROUGH_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

const TIMELINE_CATEGORY_GRAPH_DATA = "TIMELINE_CATEGORY_GRAPH_DATA";

const categoryTimelineGraphDataReducer = (
  state = initialState.categoryTimelineGraphDataReducer,
  action
) => {
  switch (action.type) {
    case TIMELINE_CATEGORY_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

const TIMELINE_GENDER_GRAPH_DATA = "TIMELINE_GENDER_GRAPH_DATA";

const genderTimelineGraphDataReducer = (
  state = initialState.genderTimelineGraphDataReducer,
  action
) => {
  switch (action.type) {
    case TIMELINE_GENDER_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

const TIMELINE_RACE_GRAPH_DATA = "TIMELINE_RACE_GRAPH_DATA";

const raceTimelineGraphDataReducer = (
  state = initialState.raceTimelineGraphDataReducer,
  action
) => {
  switch (action.type) {
    case TIMELINE_RACE_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

const INCREMENT_TOTAL_COUNT = "INCREMENT_TOTAL_COUNT";

const totalCountReducer = (state = initialState.totalCountReducer, action) => {
  switch (action.type) {
    case INCREMENT_TOTAL_COUNT:
      return {
        ...state,
        total: state.total + action.dataLength,
      };
    default:
      return { ...state };
  }
};

const APPLYING_FILTERS = "APPLYING_FILTERS";
const APPLYING_FILTERS_RESET = "APPLYING_FILTERS_RESET";

const applyingFiltersReducer = (
  state = initialState.applyingFiltersReducer,
  action
) => {
  switch (action.type) {
    case APPLYING_FILTERS:
      return {
        ...state,
        filters: true,
      };
    case APPLYING_FILTERS_RESET:
      return {
        ...state,
        filters: false,
      };
    default:
      return { ...state };
  }
};

const NEW_YEAR_FINISHED_LOADING = "NEW_YEAR_FINISHED_LOADING";
const NEW_YEAR_FINISHED_LOADING_RESET = "NEW_YEAR_FINISHED_LOADING_RESET";

const newYearFinishedLoadingReducer = (
  state = initialState.newYearFinishedLoadingReducer,
  action
) => {
  switch (action.type) {
    case NEW_YEAR_FINISHED_LOADING:
      return {
        ...state,
        finished: true,
      };
    case NEW_YEAR_FINISHED_LOADING_RESET:
      return {
        ...state,
        finished: false,
      };
    default:
      return { ...state };
  }
};

const TRENDS_AVAILABLE = "TRENDS_AVAILABLE";
const TRENDS_NOT_AVAILABLE = "TRENDS_NOT_AVAILABLE";

const trendsAvailableReducer = (
  state = initialState.trendsAvailableReducer,
  action
) => {
  switch (action.type) {
    case TRENDS_AVAILABLE:
      return {
        ...state,
        available: true,
      };
    case TRENDS_NOT_AVAILABLE:
      return {
        ...state,
        available: false,
      };
    default:
      return { ...state };
  }
};

const RootReducer = combineReducers({
  // General data states
  loadDataReducer: loadDataReducer,
  filteredDataReducer: filteredDataReducer,
  filteredDataChunksReducer: filteredDataChunksReducer,
  totalCountReducer: totalCountReducer,
  newYearFinishedLoadingReducer: newYearFinishedLoadingReducer,

  // Timeline columns
  ageTimelineColumnsReducer: ageTimelineColumnsReducer,
  boroughTimelineColumnsReducer: boroughTimelineColumnsReducer,
  categoryTimelineColumnsReducer: categoryTimelineColumnsReducer,
  raceTimelineColumnsReducer: raceTimelineColumnsReducer,
  sexTimelineColumnsReducer: sexTimelineColumnsReducer,

  // Filters
  yearFilterReducer: yearFilterReducer,
  categoryFilterReducer: categoryFilterReducer,
  offenseFilterReducer: offenseFilterReducer,
  ageFilterReducer: ageFilterReducer,
  raceFilterReducer: raceFilterReducer,
  sexFilterReducer: sexFilterReducer,
  boroughFilterReducer: boroughFilterReducer,
  applyingFiltersReducer: applyingFiltersReducer,

  // Timeline graph data
  trendsAvailableReducer: trendsAvailableReducer,
  ageGroupTimelineGraphDataReducer: ageGroupTimelineGraphDataReducer,
  boroughTimelineGraphDataReducer: boroughTimelineGraphDataReducer,
  categoryTimelineGraphDataReducer: categoryTimelineGraphDataReducer,
  genderTimelineGraphDataReducer: genderTimelineGraphDataReducer,
  raceTimelineGraphDataReducer: raceTimelineGraphDataReducer,
});

const store = createStore(RootReducer);

exposeStore(store);
