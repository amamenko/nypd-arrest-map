import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const BoroughTimeline = () => {
  const boroughTimelineColumns = useSelector(
    (state) => state.boroughTimelineColumnsReducer.columns
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
    >
      <p className="bottom_info_section_title">Borough Trends</p>
      <div className="bottom_info_pie_container">
        <Chart
          legendToggle
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={boroughTimelineColumns}
          options={{
            legendToggle: true,
            backgroundColor: "transparent",
            width: 500,
            chartArea: { width: "50%", height: "50%" },
            hAxis: {
              title: "Dates",
            },
            vAxis: {
              title: "# of Arrests",
            },
            explorer: {
              axis: "horizontal",
              keepInBounds: true,
              maxZoomIn: 0.2,
            },
          }}
        />
      </div>
    </div>
  );
};

export default BoroughTimeline;
