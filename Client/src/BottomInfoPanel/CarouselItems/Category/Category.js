import React from "react";
import { Chart } from "react-google-charts";

const Category = (props) => {
  const {
    filteredArrestCategory,
    graphOption,
    graphsDrawn,
    changeGraphsDrawn,
  } = props;

  const chartEvents = [
    {
      eventName: "ready",
      callback() {
        if (!graphsDrawn) {
          setTimeout(() => {
            changeGraphsDrawn(true);
          }, 300);
        }
      },
    },
  ];

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{
        display: graphOption === "overview" ? "block" : "none",
        opacity: graphsDrawn ? 1 : 0,
      }}
    >
      <p className="bottom_info_section_title">Breakdown by Category</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="PieChart"
          chartEvents={chartEvents}
          data={
            filteredArrestCategory
              ? [
                  ["Category", "Number of Arrests"],
                  [
                    "Felony",
                    filteredArrestCategory.filter((x) => x === "F").length,
                  ],
                  [
                    "Misdemeanor",
                    filteredArrestCategory.filter((x) => x === "M").length,
                  ],
                  [
                    "Violation",
                    filteredArrestCategory.filter((x) => x !== "F" && x !== "M")
                      .length,
                  ],
                ]
              : []
          }
          options={{
            backgroundColor: "transparent",
          }}
        />
      </div>
    </div>
  );
};

export default Category;
