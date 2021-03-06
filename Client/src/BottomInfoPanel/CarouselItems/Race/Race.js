import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const Race = (props) => {
  const { filteredRaceUniqueValues, filteredRaceArr, graphOption } = props;

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Race</p>
      <div className="bottom_info_pie_container">
        {applyingFilters ? (
          <DoubleBounce size={100} color="rgb(93, 188, 210)" />
        ) : (
          <Chart
            chartType="PieChart"
            loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
            data={
              [
                [["Race", "Number of Arrests"]].concat(
                  filteredRaceUniqueValues.map((item) => [
                    item
                      ? item
                          .split(" ")
                          .map(
                            (x) => x[0].toUpperCase() + x.slice(1).toLowerCase()
                          )
                          .join(" ")
                          .split("/")
                          .map(
                            (x) =>
                              x[0].toUpperCase() +
                              x.slice(1, x.indexOf(" ")).toLowerCase() +
                              x.slice(x.indexOf(" "))
                          )
                          .join("/")
                      : null,
                    filteredRaceArr.filter((x) => x === item).length,
                  ])
                ),
              ][0]
            }
            options={{
              backgroundColor: "transparent",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Race;
