import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const RaceTimeline = (props) => {
  const { filteredRaceUniqueValues, graphOption } = props;

  const raceArr = filteredRaceUniqueValues.map((race) =>
    race
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
      .join(" ")
      .split("/")
      .map(
        (x) =>
          x[0].toUpperCase() +
          x.slice(1, x.indexOf(" ")).toLowerCase() +
          x.slice(x.indexOf(" "))
      )
      .join("/")
  );

  const raceTimelineGraphData = useSelector(
    (state) => state.raceTimelineGraphDataReducer.data
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "trends" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Race Trends</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={
            [
              [[{ type: "date", label: "Date" }].concat(raceArr)].concat(
                raceTimelineGraphData
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

export default RaceTimeline;
