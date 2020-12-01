import React from "react";
import { Chart } from "react-google-charts";

const Borough = (props) => {
  const {
    filteredBoroughUniqueValues,
    filteredBoroughArr,
    graphOption,
  } = props;

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Borough</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="PieChart"
          data={
            [
              [["Borough", "Number of Arrests"]].concat(
                filteredBoroughUniqueValues.map((item) => [
                  item === "B"
                    ? "Bronx"
                    : item === "Q"
                    ? "Queens"
                    : item === "M"
                    ? "Manhattan"
                    : item === "K"
                    ? "Brooklyn"
                    : item === "S"
                    ? "Staten Island"
                    : "Unknown",
                  filteredBoroughArr.filter((x) => x === item).length,
                ])
              ),
            ][0]
          }
          options={{
            backgroundColor: "transparent",
          }}
        />
      </div>
    </div>
  );
};

export default Borough;
