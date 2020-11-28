import { combineReducers } from "redux";
import filteredDataChunksReducer from "./reducers/filteredDataChunks/filteredDataChunksReducer";
import loadDataChunksReducer from "./reducers/loadDataChunks/loadDataChunksReducer";
import totalCountReducer from "./reducers/totalCount/totalCountReducer";

import raceFilterReducer from "./reducers/filters/race/raceFilterReducer";
import ageFilterReducer from "./reducers/filters/age/ageFilterReducer";
import offenseFilterReducer from "./reducers/filters/offense/offenseFilterReducer";
import yearFilterReducer from "./reducers/filters/year/yearFilterReducer";
import categoryFilterReducer from "./reducers/filters/category/categoryFilterReducer";
import sexFilterReducer from "./reducers/filters/sex/sexFilterReducer";
import boroughFilterReducer from "./reducers/filters/borough/boroughFilterReducer";
import filteredDataReducer from "./reducers/filteredData/filteredDataReducer";

import ageGroupTimelineGraphDataReducer from "./reducers/timelineGraphData/ageGroup/ageGroupTimelineGraphDataReducer";
import boroughTimelineGraphDataReducer from "./reducers/timelineGraphData/borough/boroughTimelineGraphDataReducer";
import categoryTimelineGraphDataReducer from "./reducers/timelineGraphData/category/categoryTimelineGraphDataReducer";
import genderTimelineGraphDataReducer from "./reducers/timelineGraphData/gender/genderTimelineGraphDataReducer";
import raceTimelineGraphDataReducer from "./reducers/timelineGraphData/race/raceTimelineGraphDataReducer";

import ageTimelineColumnsReducer from "./reducers/timelineColumns/age/ageTimelineColumnsReducer";
import boroughTimelineColumnsReducer from "./reducers/timelineColumns/borough/boroughTimelineColumnsReducer";
import categoryTimelineColumnsReducer from "./reducers/timelineColumns/category/categoryTimelineColumnsReducer";
import raceTimelineColumnsReducer from "./reducers/timelineColumns/race/raceTimelineColumnsReducer";
import sexTimelineColumnsReducer from "./reducers/timelineColumns/sex/sexTimelineColumnsReducer";

const RootReducer = combineReducers({
  // General data states
  filteredDataReducer: filteredDataReducer,
  filteredDataChunksReducer: filteredDataChunksReducer,
  loadDataChunksReducer: loadDataChunksReducer,
  totalCountReducer: totalCountReducer,

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

  // Timeline graph data
  ageGroupTimelineGraphDataReducer: ageGroupTimelineGraphDataReducer,
  boroughTimelineGraphDataReducer: boroughTimelineGraphDataReducer,
  categoryTimelineGraphDataReducer: categoryTimelineGraphDataReducer,
  genderTimelineGraphDataReducer: genderTimelineGraphDataReducer,
  raceTimelineGraphDataReducer: raceTimelineGraphDataReducer,
});

export default RootReducer;
