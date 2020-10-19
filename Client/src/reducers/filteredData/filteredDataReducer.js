const ASSIGN_FILTERED_DATA = "ASSIGN_FILTERED_DATA";

const filteredDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case ASSIGN_FILTERED_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default filteredDataReducer;
