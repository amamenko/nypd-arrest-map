const BOROUGH_TIMELINE_COLUMNS = "BOROUGH_TIMELINE_COLUMNS";

const boroughTimelineColumnsReducer = (state = { columns: [] }, action) => {
  switch (action.type) {
    case BOROUGH_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

export default boroughTimelineColumnsReducer;
