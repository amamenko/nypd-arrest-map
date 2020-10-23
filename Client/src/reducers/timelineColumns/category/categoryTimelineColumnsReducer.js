const CATEGORY_TIMELINE_COLUMNS = "CATEGORY_TIMELINE_COLUMNS";

const categoryTimelineColumnReducer = (state = { columns: [] }, action) => {
  switch (action.type) {
    case CATEGORY_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

export default categoryTimelineColumnReducer;
