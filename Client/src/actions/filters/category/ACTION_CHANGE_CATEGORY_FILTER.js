const CHANGE_CATEGORY_FILTER = "CHANGE_CATEGORY_FILTER";

const ACTION_CHANGE_CATEGORY_FILTER = (category) => {
  return {
    type: CHANGE_CATEGORY_FILTER,
    category,
  };
};

export default ACTION_CHANGE_CATEGORY_FILTER;
