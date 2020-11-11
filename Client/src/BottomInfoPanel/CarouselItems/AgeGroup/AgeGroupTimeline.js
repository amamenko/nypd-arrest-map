import React, { useRef, useState } from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";
import Tippy from "@tippyjs/react";

const AgeGroupTimeline = (props) => {
  const { graphOption } = props;

  const ageTimelineColumns = useSelector(
    (state) => state.ageTimelineColumnsReducer.columns
  );

  const trendContainerRef = useRef(null);

  const [tooltipVisible, changeTooltipVisible] = useState(true);

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "trends" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Age Group Trends</p>
      <div className="bottom_info_pie_container" ref={trendContainerRef}>
        <Tippy
          content="Scroll to zoom in and out of trend graphs"
          visible={graphOption === "trends" && tooltipVisible}
          reference={trendContainerRef.current}
          className="burger_tooltip"
          placement="top"
          onClickOutside={() => changeTooltipVisible(false)}
        />
        <Tippy
          content="Toggle data lines by selecting legend items"
          visible={graphOption === "trends" && tooltipVisible}
          reference={trendContainerRef.current}
          className="burger_tooltip"
          placement="right"
          offset={[0, 35]}
          onClickOutside={() => changeTooltipVisible(false)}
        />
        <Chart
          legendToggle
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={ageTimelineColumns}
          options={{
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

export default AgeGroupTimeline;
