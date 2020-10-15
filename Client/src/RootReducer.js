import { combineReducers } from "redux";
import filteredDataChunksReducer from "./reducers/filteredDataChunks/filteredDataChunksReducer";
import loadDataChunksReducer from "./reducers/loadDataChunks/loadDataChunksReducer";

const RootReducer = combineReducers({
  filteredDataChunksReducer: filteredDataChunksReducer,
  loadDataChunksReducer: loadDataChunksReducer,
});

export default RootReducer;
