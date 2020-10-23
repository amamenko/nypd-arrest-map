const RACE_TIMELINE_COLUMNS = "RACE_TIMELINE_COLUMNS";

const raceTimelineColumnReducer = (state = { columns: [] }, action) => {
  switch (action.type) {
    case RACE_TIMELINE_COLUMNS:
      return {
        ...state,
        columns: action.columns,
      };
    default:
      return { ...state };
  }
};

export default raceTimelineColumnReducer;
