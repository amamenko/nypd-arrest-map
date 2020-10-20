const TIMELINE_CATEGORY_GRAPH_DATA = "TIMELINE_CATEGORY_GRAPH_DATA";

const categoryTimelineGraphDataReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case TIMELINE_CATEGORY_GRAPH_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return { ...state };
  }
};

export default categoryTimelineGraphDataReducer;
