const LOAD_DATA_CHUNKS_ADD_YEAR = "LOAD_DATA_CHUNKS_ADD_YEAR";

const ACTION_LOAD_DATA_CHUNKS_ADD_YEAR = (data, year) => {
  return {
    type: LOAD_DATA_CHUNKS_ADD_YEAR,
    data,
    year,
  };
};

export default ACTION_LOAD_DATA_CHUNKS_ADD_YEAR;
