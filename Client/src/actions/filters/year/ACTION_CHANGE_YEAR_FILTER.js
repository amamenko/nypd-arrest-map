const CHANGE_YEAR_FILTER = "CHANGE_YEAR_FILTER";

const ACTION_CHANGE_YEAR_FILTER = (year) => {
  return {
    type: CHANGE_YEAR_FILTER,
    year,
  };
};

export default ACTION_CHANGE_YEAR_FILTER;
