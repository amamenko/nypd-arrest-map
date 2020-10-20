const TIMELINE_RACE_GRAPH_DATA = "TIMELINE_RACE_GRAPH_DATA";

const raceTimelineGraphDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case TIMELINE_RACE_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default raceTimelineGraphDataReducer;
