const TIMELINE_BOROUGH_GRAPH_DATA = "TIMELINE_BOROUGH_GRAPH_DATA";

const boroughTimelineGraphDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case TIMELINE_BOROUGH_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default boroughTimelineGraphDataReducer;
