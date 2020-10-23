const AGE_TIMELINE_COLUMNS = "AGE_TIMELINE_COLUMNS";

const ACTION_AGE_TIMELINE_COLUMNS = (columns) => {
  return {
    type: AGE_TIMELINE_COLUMNS,
    columns,
  };
};

export default ACTION_AGE_TIMELINE_COLUMNS;
