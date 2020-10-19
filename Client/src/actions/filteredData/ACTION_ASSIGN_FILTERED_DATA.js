const ASSIGN_FILTERED_DATA = "ASSIGN_FILTERED_DATA";

const ACTION_ASSIGN_FILTERED_DATA = (data) => {
  return {
    type: ASSIGN_FILTERED_DATA,
    data,
  };
};

export default ACTION_ASSIGN_FILTERED_DATA;
