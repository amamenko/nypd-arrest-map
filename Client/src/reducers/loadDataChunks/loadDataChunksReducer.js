const LOAD_DATA_CHUNKS_ADD_YEAR = "LOAD_DATA_CHUNKS_ADD_YEAR";
const LOAD_DATA_CHUNKS_ADD_TO_YEAR = "LOAD_DATA_CHUNKS_ADD_TO_YEAR";

const loadDataChunksReducer = (state = { data: [{}] }, action) => {
  switch (action.type) {
    // Year does not exist, create new year and assign it initial data
    case LOAD_DATA_CHUNKS_ADD_YEAR:
      let newAssignState = state.data[0];
      newAssignState[action.year.toString()] = [action.data];

      return {
        ...state,
        data: [newAssignState],
      };
    // Year exists, add additional data to its initial data
    case LOAD_DATA_CHUNKS_ADD_TO_YEAR:
      const newPushState = state.data[0];
      newPushState[action.year.toString()].push(action.data);

      return {
        ...state,
        data: [newPushState],
      };
    default:
      return { ...state };
  }
};

export default loadDataChunksReducer;
