const TIMELINE_GENDER_GRAPH_DATA = "TIMELINE_GENDER_GRAPH_DATA";

const genderTimelineGraphDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case TIMELINE_GENDER_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default genderTimelineGraphDataReducer;
