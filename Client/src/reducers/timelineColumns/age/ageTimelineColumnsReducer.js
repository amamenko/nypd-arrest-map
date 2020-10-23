const AGE_TIMELINE_COLUMNS = "AGE_TIMELINE_COLUMNS";

const ageTimelineColumnReducer = (state = { columns: [] }, action) => {
  switch (action.type) {
    case AGE_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

export default ageTimelineColumnReducer;
