const ASSIGN_FILTERED_DATA = "ASSIGN_FILTERED_DATA";
const FILTERED_DATA_CHANGED = "FILTERED_DATA_CHANGED";
const FILTERED_DATA_CHANGED_RESET = "FILTERED_DATA_CHANGED_RESET";

const filteredDataReducer = (state = { data: [], changed: false }, action) => {
  switch (action.type) {
    case ASSIGN_FILTERED_DATA:
      return {
        ...state,
        data: action.data,
      };
    case FILTERED_DATA_CHANGED:
      return {
        ...state,
        changed: true,
      };
    case FILTERED_DATA_CHANGED_RESET:
      return {
        ...state,
        changed: false,
      };
    default:
      return { ...state };
  }
};

export default filteredDataReducer;
