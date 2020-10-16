const INCREMENT_TOTAL_COUNT = "INCREMENT_TOTAL_COUNT";

const ACTION_INCREMENT_TOTAL_COUNT = (dataLength) => {
  return {
    type: INCREMENT_TOTAL_COUNT,
    dataLength,
  };
};

export default ACTION_INCREMENT_TOTAL_COUNT;
