import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const CategoryTimeline = (props) => {
  const { filteredUniqueCategory, graphOption } = props;

  const uniqueValues = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  const categoryArr =
    filteredUniqueCategory.length > 0
      ? filteredUniqueCategory
          .map((x) =>
            x === "F" ? "Felony" : x === "M" ? "Misdemeanor" : "Violation"
          )
          .filter(uniqueValues)
      : [];

  const categoryTimelineGraphData = useSelector(
    (state) => state.categoryTimelineGraphDataReducer.data
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "trends" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Category Trends</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={
            [
              [[{ type: "date", label: "Date" }].concat(categoryArr)].concat(
                categoryTimelineGraphData
              ),
            ][0]
          }
          options={{
            backgroundColor: "transparent",
            width: 500,
            chartArea: { width: "50%", height: "50%" },
          }}
        />
      </div>
    </div>
  );
};

export default CategoryTimeline;
