const LOAD_DATA_CHUNKS = "LOAD_DATA_CHUNKS";

const loadDataChunksReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case LOAD_DATA_CHUNKS:
      return { ...state, data: action.data };
    default:
      return { ...state };
  }
};

export default loadDataChunksReducer;
