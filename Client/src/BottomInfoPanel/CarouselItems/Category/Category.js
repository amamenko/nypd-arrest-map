import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";

const Category = (props) => {
  const { filteredArrestCategory, graphOption } = props;

  const chartEvents = [
    {
      eventName: "select",
      callback({ chartWrapper }) {
        return chartWrapper.getChart().setSelection([]);
      },
    },
  ];

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Category</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartEvents={chartEvents}
          chartType="PieChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
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
