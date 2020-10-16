const CHANGE_SEX_FILTER = "CHANGE_SEX_FILTER";

const sexFilterReducer = (state = { sex: [] }, action) => {
  switch (action.type) {
    case CHANGE_SEX_FILTER:
      return {
        ...state,
        sex: action.sex,
      };
    default:
      return { ...state };
  }
};

export default sexFilterReducer;
