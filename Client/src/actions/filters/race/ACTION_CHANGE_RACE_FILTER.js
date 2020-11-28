const CHANGE_RACE_FILTER = "CHANGE_RACE_FILTER";

const ACTION_CHANGE_RACE_FILTER = (race) => {
  return {
    type: CHANGE_RACE_FILTER,
    race,
  };
};

export default ACTION_CHANGE_RACE_FILTER;
