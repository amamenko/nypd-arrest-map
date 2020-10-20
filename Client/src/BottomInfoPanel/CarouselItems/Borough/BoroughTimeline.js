import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const BoroughTimeline = (props) => {
  const { filteredBoroughUniqueValues, graphOption } = props;

  const boroughTimelineGraphData = useSelector(
    (state) => state.boroughTimelineGraphDataReducer.data
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "trends" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Borough Trends</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={
            [
              [
                [{ type: "date", label: "Date" }].concat(
                  filteredBoroughUniqueValues.map((borough) =>
                    borough === "B"
                      ? "Bronx"
                      : borough === "Q"
                      ? "Queens"
                      : borough === "M"
                      ? "Manhattan"
                      : borough === "K"
                      ? "Brooklyn"
                      : borough === "S"
                      ? "Staten Island"
                      : "Unknown"
                  )
                ),
              ].concat(boroughTimelineGraphData),
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

export default BoroughTimeline;
