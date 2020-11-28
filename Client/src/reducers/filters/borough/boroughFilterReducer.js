const CHANGE_BOROUGH_FILTER = "CHANGE_BOROUGH_FILTER";

const boroughFilterReducer = (state = { borough: [] }, action) => {
  switch (action.type) {
    case CHANGE_BOROUGH_FILTER:
      return {
        ...state,
        borough: action.borough,
      };
    default:
      return { ...state };
  }
};

export default boroughFilterReducer;
