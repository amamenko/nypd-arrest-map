const CHANGE_AGE_FILTER = "CHANGE_AGE_FILTER";

const ageFilterReducer = (state = { age: [] }, action) => {
  switch (action.type) {
    case CHANGE_AGE_FILTER:
      return {
        ...state,
        age: action.age,
      };
    default:
      return { ...state };
  }
};

export default ageFilterReducer;
