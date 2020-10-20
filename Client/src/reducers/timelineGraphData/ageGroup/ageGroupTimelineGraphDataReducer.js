const TIMELINE_AGE_GROUP_GRAPH_DATA = "TIMELINE_AGE_GROUP_GRAPH_DATA";

const ageGroupTimelineGraphDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case TIMELINE_AGE_GROUP_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default ageGroupTimelineGraphDataReducer;
