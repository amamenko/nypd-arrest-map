const CHANGE_AGE_FILTER = "CHANGE_AGE_FILTER";

const ACTION_CHANGE_AGE_FILTER = (age) => {
  return {
    type: CHANGE_AGE_FILTER,
    age,
  };
};

export default ACTION_CHANGE_AGE_FILTER;
