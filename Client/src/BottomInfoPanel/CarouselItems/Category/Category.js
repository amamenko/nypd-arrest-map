import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";

const Category = (props) => {
  const { filteredArrestCategory, graphOption } = props;

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ visibility: graphOption === "overview" ? "visible" : "hidden" }}
    >
      <p className="bottom_info_section_title">Breakdown by Category</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="PieChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={[
            ["Category", "Number of Arrests"],
            ["Felony", filteredArrestCategory.filter((x) => x === "F").length],
            [
              "Misdemeanor",
              filteredArrestCategory.filter((x) => x === "M").length,
            ],
            [
              "Violation",
              filteredArrestCategory.filter((x) => x !== "F" && x !== "M")
                .length,
            ],
          ]}
          options={{
            backgroundColor: "transparent",
          }}
        />
      </div>
    </div>
  );
};

export default Category;
