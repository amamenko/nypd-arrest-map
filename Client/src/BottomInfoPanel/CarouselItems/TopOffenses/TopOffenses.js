import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";

const TopOffenses = (props) => {
  const {
    filteredOffenseDescriptionArr,
    filteredOffenseDescriptionUniqueValues,
    graphOption,
  } = props;

  const sortedArr =
    filteredOffenseDescriptionArr.length > 0 &&
    filteredOffenseDescriptionUniqueValues.length > 0
      ? filteredOffenseDescriptionUniqueValues
          .map((item) => [
            item,
            filteredOffenseDescriptionArr.filter((x) => x === item).length,
          ])
          .sort((a, b) => {
            if (a[1] > b[1]) {
              return 1;
            } else {
              return -1;
            }
          })
      : null;

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      {sortedArr ? (
        <>
          <p className="bottom_info_section_title">Top 5 Offenses</p>
          <div className="bottom_info_pie_container">
            <Chart
              chartType="BarChart"
              loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
              data={
                [
                  [["Offense Description", "Number of Arrests"]].concat(
                    sortedArr
                      ? sortedArr
                          .slice(sortedArr.length - 5, sortedArr.length)
                          .sort((a, b) => {
                            if (a[1] > b[1]) {
                              return -1;
                            } else {
                              return 1;
                            }
                          })
                      : ["UNKNOWN", 1]
                  ),
                ][0]
              }
              options={{
                backgroundColor: "transparent",
                bar: { groupWidth: "95%" },
                legend: { position: "none" },
                width: 600,
                chartArea: { width: "50%", height: "50%" },
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TopOffenses;
