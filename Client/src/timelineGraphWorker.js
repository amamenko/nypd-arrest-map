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

  const filteredArray = arr
    .sort((a, b) => {
      if (dayjs(a, "MM/DD/YYYY").isBefore(dayjs(b, "MM/DD/YYYY"))) {
        return -1;
      } else {
        return 1;
      }
    })
    .map((date) => {
      const dateArr = date ? date.split("/") : null;

      if (name === "raceTimelineGraphData") {
        return [
          new Date(dateArr[2], dateArr[0] - 1, dateArr[1]),
          unique
            .map((race) =>
              race
                .split(" ")
                .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
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
                      .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
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
        ].flat();
      } else if (name === "categoryTimelineGraphData") {
        return [
          new Date(dateArr[2], dateArr[0] - 1, dateArr[1]),
          unique
            .map((x) =>
              x === "F" ? "Felony" : x === "M" ? "Misdemeanor" : "Violation"
            )
            .filter(uniqueValues)
            .map(
              (item) =>
                dataArr[0].filter(
                  (x) => x.date === date && x[generalName] === item
                ).length
            ),
        ].flat();
      } else if (name === "genderTimelineGraphData") {
        return [
          new Date(dateArr[2], dateArr[0] - 1, dateArr[1]),
          unique
            .map((x) => (x === "F" ? "Female" : "Male"))
            .map(
              (item) =>
                dataArr[0].filter(
                  (x) => x.date === date && x[generalName] === item
                ).length
            ),
        ].flat();
      } else {
        return [
          new Date(dateArr[2], dateArr[0] - 1, dateArr[1]),
          unique.map(
            (item) =>
              dataArr[0].filter(
                (x) => x.date === date && x[generalName] === item
              ).length
          ),
        ].flat();
      }
    });

  postMessage({
    arrayName: name,
    returnedArr: arr && dataArr[0] ? filteredArray : [],
  });
};
