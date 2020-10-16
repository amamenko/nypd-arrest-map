import { combineReducers } from "redux";
import filteredDataChunksReducer from "./reducers/filteredDataChunks/filteredDataChunksReducer";
import loadDataChunksReducer from "./reducers/loadDataChunks/loadDataChunksReducer";
import totalCountReducer from "./reducers/totalCount/totalCountReducer";

const RootReducer = combineReducers({
  filteredDataChunksReducer: filteredDataChunksReducer,
  loadDataChunksReducer: loadDataChunksReducer,
  totalCountReducer: totalCountReducer,
});

export default RootReducer;
