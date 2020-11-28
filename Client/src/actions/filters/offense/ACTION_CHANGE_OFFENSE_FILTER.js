const CHANGE_OFFENSE_FILTER = "CHANGE_OFFENSE_FILTER";

const ACTION_CHANGE_OFFENSE_FILTER = (offense) => {
  return {
    type: CHANGE_OFFENSE_FILTER,
    offense,
  };
};

export default ACTION_CHANGE_OFFENSE_FILTER;
