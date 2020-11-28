const ASSIGN_LOAD_DATA = "ASSIGN_LOAD_DATA";

const ACTION_ASSIGN_LOAD_DATA = (data) => {
  return {
    type: ASSIGN_LOAD_DATA,
    data,
  };
};

export default ACTION_ASSIGN_LOAD_DATA;
