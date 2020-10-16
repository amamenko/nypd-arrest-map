const CHANGE_YEAR_FILTER = "CHANGE_YEAR_FILTER";

const yearFilterReducer = (state = { year: [] }, action) => {
  switch (action.type) {
    case CHANGE_YEAR_FILTER:
      return {
        ...state,
        year: action.year,
      };
    default:
      return { ...state };
  }
};

export default yearFilterReducer;
