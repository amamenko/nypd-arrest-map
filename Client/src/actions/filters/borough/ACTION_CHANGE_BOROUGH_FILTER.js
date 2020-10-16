const CHANGE_BOROUGH_FILTER = "CHANGE_BOROUGH_FILTER";

const ACTION_CHANGE_BOROUGH_FILTER = (borough) => {
  return {
    type: CHANGE_BOROUGH_FILTER,
    borough,
  };
};

export default ACTION_CHANGE_BOROUGH_FILTER;
