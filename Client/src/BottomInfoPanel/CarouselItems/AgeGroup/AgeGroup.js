import React from "react";
import { Chart } from "react-google-charts";

const AgeGroup = (props) => {
  const { filteredAgeGroupData, filteredAgeGroup, graphOption } = props;

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Age Group</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="PieChart"
          data={
            [
              [["Age Group", "Number of Arrests"]].concat(
                filteredAgeGroupData
                  .sort((a, b) => a.localeCompare(b))
                  .map((item) => [
                    item === "65" ? "65+" : item,
                    filteredAgeGroup.filter((x) => x === item).length,
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

export default AgeGroup;
