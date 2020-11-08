import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { wrapStore } from "redux-in-worker";
import storeWorker from "worker-loader!./store.worker.js"; // eslint-disable-line import/no-webpack-loader-syntax

require("dotenv").config();

const initialState = {
  loadDataChunksReducer: { data: [{}] },
  loadDataReducer: { data: [] },
  filteredDataReducer: {
    data: [],
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
  ageTimelineColumnsReducer: { columns: [] },
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
};

const store = wrapStore(new storeWorker(), initialState);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
