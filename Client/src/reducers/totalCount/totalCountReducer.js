const INCREMENT_TOTAL_COUNT = "INCREMENT_TOTAL_COUNT";

const totalCountReducer = (state = { total: 0 }, action) => {
  switch (action.type) {
    case INCREMENT_TOTAL_COUNT:
      return {
        ...state,
        total: state.total + action.dataLength,
      };
    default:
      return { ...state };
  }
};

export default totalCountReducer;
