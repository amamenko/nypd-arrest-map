const FILTERED_DATA_CHUNKS = "FILTERED_DATA_CHUNKS";

const filteredDataChunksReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case FILTERED_DATA_CHUNKS:
      return { ...state, data: action.data };
    default:
      return { ...state };
  }
};

export default filteredDataChunksReducer;
