const CHANGE_RACE_FILTER = "CHANGE_RACE_FILTER";

const raceFilterReducer = (state = { race: [] }, action) => {
  switch (action.type) {
    case CHANGE_RACE_FILTER:
      return {
        ...state,
        race: action.race,
      };
    default:
      return { ...state };
  }
};

export default raceFilterReducer;
