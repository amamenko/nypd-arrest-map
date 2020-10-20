import dayjs from "dayjs";

onmessage = (e) => {
  const uniqueValues = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  const dataSent = e.data;

  const name = dataSent.arrName;
  const arr = dataSent.arr;
  const generalName = dataSent.generalName;
  const unique = dataSent.unique;
  const dataArr = dataSent.dataArr;

  postMessage(
    JSON.stringify({
      arrayName: name,
      returnedArr: arr
        ? arr
            .sort((a, b) => {
              if (dayjs(a, "MM/DD/YYYY").isBefore(dayjs(b, "MM/DD/YYYY"))) {
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

              name === "raceTimelineGraphData"
                ? [
                    dateObj,
                    unique
                      .map((race) =>
                        race
                          .split(" ")
                          .map(
                            (x) => x[0].toUpperCase() + x.slice(1).toLowerCase()
                          )
                          .join(" ")
                          .split("/")
                          .map(
                            (x) =>
                              x[0].toUpperCase() +
                              x.slice(1, x.indexOf(" ")).toLowerCase() +
                              x.slice(x.indexOf(" "))
                          )
                          .join("/")
                      )
                      .map(
                        (item) =>
                          dataArr[0].filter(
                            (x) =>
                              x.date === date &&
                              x[generalName]
                                .split(" ")
                                .map(
                                  (x) =>
                                    x[0].toUpperCase() +
                                    x.slice(1).toLowerCase()
                                )
                                .join(" ")
                                .split("/")
                                .map(
                                  (x) =>
                                    x[0].toUpperCase() +
                                    x.slice(1, x.indexOf(" ")).toLowerCase() +
                                    x.slice(x.indexOf(" "))
                                )
                                .join("/") === item
                          ).length
                      ),
                  ]
                : name === "categoryTimelineGraphData"
                ? [
                    dateObj,
                    unique
                      .map((x) =>
                        x === "F"
                          ? "Felony"
                          : x === "M"
                          ? "Misdemeanor"
                          : "Violation"
                      )
                      .filter(uniqueValues)
                      .map(
                        (item) =>
                          dataArr[0].filter(
                            (x) => x.date === date && x[generalName] === item
                          ).length
                      ),
                  ]
                : name === "genderTimelineGraphData"
                ? [
                    dateObj,
                    unique
                      .map((x) => (x === "F" ? "Female" : "Male"))
                      .map(
                        (item) =>
                          dataArr[0].filter(
                            (x) => x.date === date && x[generalName] === item
                          ).length
                      ),
                  ]
                : [
                    dateObj,
                    unique.map(
                      (item) =>
                        dataArr[0].filter(
                          (x) => x.date === date && x[generalName] === item
                        ).length
                    ),
                  ];
            })
            .flat()
        : [],
    })
  );
};
