const CHANGE_OFFENSE_FILTER = "CHANGE_OFFENSE_FILTER";

const offenseFilterReducer = (state = { offense: [] }, action) => {
  switch (action.type) {
    case CHANGE_OFFENSE_FILTER:
      return {
        ...state,
        offense: action.offense,
      };
    default:
      return { ...state };
  }
};

export default offenseFilterReducer;
