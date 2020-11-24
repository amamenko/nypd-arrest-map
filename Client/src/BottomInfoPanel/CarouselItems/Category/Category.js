import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import { useSelector } from "react-redux";

const Category = (props) => {
  const { filteredArrestCategory, graphOption } = props;

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "overview" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Breakdown by Category</p>
      <div className="bottom_info_pie_container">
        {applyingFilters ? (
          <DoubleBounce size={100} color="rgb(93, 188, 210)" />
        ) : (
          <Chart
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
                      filteredArrestCategory.filter(
                        (x) => x !== "F" && x !== "M"
                      ).length,
                    ],
                  ]
                : []
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

export default Category;
