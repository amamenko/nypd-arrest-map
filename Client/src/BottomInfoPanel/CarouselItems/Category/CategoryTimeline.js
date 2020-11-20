import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const CategoryTimeline = (props) => {
  const { isMobileOrTablet, isMediumLaptop } = props;

  const categoryTimelineColumns = useSelector(
    (state) => state.categoryTimelineColumnsReducer.columns
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
    >
      <p className="bottom_info_section_title">Category Trends</p>
      <div className="bottom_info_pie_container category_timeline_container">
        <Chart
          legendToggle
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={categoryTimelineColumns}
          options={{
            legendToggle: true,
            backgroundColor: "transparent",
            width: isMobileOrTablet ? 300 : isMediumLaptop ? 400 : 500,
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

export default CategoryTimeline;
