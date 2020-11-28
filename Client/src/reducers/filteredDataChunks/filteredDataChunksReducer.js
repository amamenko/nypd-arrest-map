const FILTERED_DATA_CHUNKS_ADD_YEAR = "FILTERED_DATA_CHUNKS_ADD_YEAR";
const FILTERED_DATA_CHUNKS_ADD_TO_YEAR = "FILTERED_DATA_CHUNKS_ADD_TO_YEAR";
const ASSIGN_FILTERED_DATA_CHUNKS = "ASSIGN_FILTERED_DATA_CHUNKS";

const filteredDataChunksReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case FILTERED_DATA_CHUNKS_ADD_YEAR:
      const newPushState = state.data;
      newPushState.push(action.data);

      return { ...state, data: newPushState };
    case FILTERED_DATA_CHUNKS_ADD_TO_YEAR:
      const newConcatState = state.data;

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

export default filteredDataChunksReducer;
