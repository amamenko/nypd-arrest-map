const SEX_TIMELINE_COLUMNS = "SEX_TIMELINE_COLUMNS";

const sexTimelineColumnReducer = (state = { columns: [] }, action) => {
  switch (action.type) {
    case SEX_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

export default sexTimelineColumnReducer;
