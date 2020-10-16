const CHANGE_CATEGORY_FILTER = "CHANGE_CATEGORY_FILTER";

const categoryFilterReducer = (state = { category: [] }, action) => {
  switch (action.type) {
    case CHANGE_CATEGORY_FILTER:
      return {
        ...state,
        category: action.category,
      };
    default:
      return { ...state };
  }
};

export default categoryFilterReducer;
