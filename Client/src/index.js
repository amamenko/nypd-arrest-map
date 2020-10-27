import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { wrapStore } from "redux-in-worker";
import storeWorker from "worker-loader!./store.worker.js"; // eslint-disable-line import/no-webpack-loader-syntax

require("dotenv").config();

// const store = createStore(RootReducer);
const initialState = {
  filteredDataReducer: {
    data: [],
    changed: false,
  },
  filteredDataChunksReducer: {
    data: [],
  },
  ageFilterReducer: {
    age: [],
  },
  boroughFilterReducer: { borough: [] },
  categoryFilterReducer: { category: [] },
  offenseFilterReducer: { offense: [] },
  raceFilterReducer: { race: [] },
  sexFilterReducer: { sex: [] },
  yearFilterReducer: { year: [] },
  loadDataChunksReducer: { data: [{}] },
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
};

const store = wrapStore(
  new storeWorker(),
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
