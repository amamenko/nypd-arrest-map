import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";

const Gender = (props) => {
  const { filteredSexUniqueValues, filteredSexArr, graphOption } = props;

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ visibility: graphOption === "overview" ? "visible" : "hidden" }}
    >
      <p className="bottom_info_section_title">Breakdown by Sex</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="PieChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={
            [
              [["Sex", "Number of Arrests"]].concat(
                filteredSexUniqueValues.map((item) => [
                  item === "M" ? "Male" : "Female",
                  filteredSexArr.filter((x) => x === item).length,
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

export default Gender;
