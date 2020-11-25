import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const AgeGroup = (props) => {
  const { filteredAgeGroupData, filteredAgeGroup, graphOption } = props;

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Age Group</p>
      <div className="bottom_info_pie_container">
        {applyingFilters ? (
          <DoubleBounce size={100} color="rgb(93, 188, 210)" />
        ) : (
          <Chart
            chartType="PieChart"
            loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
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
        )}
      </div>
    </div>
  );
};

export default AgeGroup;
