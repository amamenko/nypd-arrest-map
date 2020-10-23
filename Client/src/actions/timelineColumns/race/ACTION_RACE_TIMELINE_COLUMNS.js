const RACE_TIMELINE_COLUMNS = "RACE_TIMELINE_COLUMNS";

const ACTION_RACE_TIMELINE_COLUMNS = (columns) => {
  return {
    type: RACE_TIMELINE_COLUMNS,
    columns,
  };
};

export default ACTION_RACE_TIMELINE_COLUMNS;
