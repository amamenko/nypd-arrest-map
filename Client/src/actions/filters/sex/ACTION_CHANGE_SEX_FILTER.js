const CHANGE_SEX_FILTER = "CHANGE_SEX_FILTER";

const ACTION_CHANGE_SEX_FILTER = (sex) => {
  return {
    type: CHANGE_SEX_FILTER,
    sex,
  };
};

export default ACTION_CHANGE_SEX_FILTER;
