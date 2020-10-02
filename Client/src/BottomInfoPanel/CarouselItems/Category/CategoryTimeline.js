import React from "react";
import { Chart } from "react-google-charts";
import DoubleBounce from "better-react-spinkit/dist/DoubleBounce";
import dayjs from "dayjs";

const CategoryTimeline = (props) => {
  const {
    filteredUniqueDates,
    filteredTimelineCategoryData,
    filteredUniqueCategory,
    graphOption,
    uniqueValues,
  } = props;

  const categoryArr = filteredUniqueCategory[0]
    ? filteredUniqueCategory[0]
        .map((x) =>
          x === "F" ? "Felony" : x === "M" ? "Misdemeanor" : "Violation"
        )
        .filter(uniqueValues)
    : [];

  return (
    <div
      className="bottom_info_panel_info_box"
      onDragStart={(e) => e.preventDefault()}
      style={{ display: graphOption === "trends" ? "block" : "none" }}
    >
      <p className="bottom_info_section_title">Category Trends</p>
      <div className="bottom_info_pie_container">
        <Chart
          chartType="LineChart"
          loader={<DoubleBounce size={100} color="rgb(93, 188, 210)" />}
          data={
            [
              [[{ type: "date", label: "Date" }].concat(categoryArr)].concat(
                filteredUniqueDates.length > 0
                  ? filteredUniqueDates[0]
                      .sort((a, b) => {
                        if (
                          dayjs(a, "MM/DD/YYYY").isBefore(
                            dayjs(b, "MM/DD/YYYY")
                          )
                        ) {
                          return -1;
                        } else {
                          return 1;
                        }
                      })
                      .map((date) => {
                        const dateArr = date ? date.split("/") : null;
                        const dateObj =
                          dateArr.length > 0
                            ? new Date(dateArr[2], dateArr[0] - 1, dateArr[1])
                            : null;

                        return [
                          dateObj,
                          categoryArr.map(
                            (item) =>
                              filteredTimelineCategoryData[0].filter(
                                (x) => x.date === date && x.category === item
                              ).length
                          ),
                        ].flat();
                      })
                  : []
              ),
            ][0]
          }
          options={{
            backgroundColor: "transparent",
            width: 500,
            chartArea: { width: "50%", height: "50%" },
          }}
        />
      </div>
    </div>
  );
};

export default CategoryTimeline;
