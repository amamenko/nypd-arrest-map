import dayjs from "dayjs";
import groupBy from "lodash.groupby";

onmessage = (e) => {
  const dataSent = e.data;

  const argumentsLength = Object.entries(dataSent).length;

  // Changing Data Filters
  if (argumentsLength === 8) {
    const year = dataSent.year;
    const category = dataSent.category;
    const offense = dataSent.offense;
    const age = dataSent.age;
    const race = dataSent.race;
    const sex = dataSent.sex;
    const borough = dataSent.borough;
    const suppliedData = dataSent.suppliedData;

    const assignFilteredData = [suppliedData].map((chunk) => {
      return chunk.filter((x) => {
        if (
          (year.includes(
            Number(dayjs(x.ARREST_DATE, "MM/DD/YYYY").format("YYYY"))
          ) ||
            year.length === 0) &&
          (category.includes(x.LAW_CAT_CD) || category.length === 0) &&
          (offense.includes(x.OFNS_DESC) || offense.length === 0) &&
          (age.includes(x.AGE_GROUP) || age.length === 0) &&
          (race.includes(x.PERP_RACE) || race.length === 0) &&
          (sex.includes(x.PERP_SEX) || sex.length === 0) &&
          (race.includes(x.PERP_RACE) || race.length === 0) &&
          (borough.includes(
            x.ARREST_BORO === "K" && Number(x.Latitude) > 40.77
              ? "B"
              : x.ARREST_BORO === "M" &&
                Number(x.Longitude) > -73.920961 &&
                Number(x.Latitude) < 40.800709
              ? "Q"
              : x.ARREST_BORO === "B" && Number(x.Latitude) < 40.697465
              ? "K"
              : (x.ARREST_BORO === "B" &&
                  Number(x.Latitude) > 40.796669 &&
                  Number(x.Longitude) < -73.932786) ||
                (x.ARREST_BORO === "B" &&
                  Number(x.Latitude) < 40.796669 &&
                  Number(x.Longitude) < -73.98)
              ? "M"
              : x.ARREST_BORO === "Q" && Number(x.Longitude) < -73.962745
              ? "M"
              : x.ARREST_BORO === "Q" &&
                Number(x.Longitude) < -73.878559 &&
                Number(x.Latitude) > 40.787907
              ? "B"
              : x.ARREST_BORO
          ) ||
            borough.length === 0)
        ) {
          return true;
        } else {
          return false;
        }
      });
    });

    const assignFilteredDataFlat = assignFilteredData.flat();

    postMessage({
      assignFilteredData: assignFilteredData,
      assignFilteredDataFlat: assignFilteredDataFlat,
    });
  } else {
    const t0 = performance.now();

    // Timeline graph calculations
    const ageObj = dataSent.ageObj;
    const raceObj = dataSent.raceObj;
    const categoryObj = dataSent.categoryObj;
    const sexObj = dataSent.sexObj;
    const boroughObj = dataSent.boroughObj;

    const timelineGraphDataReducerFunction = (
      generalName,
      uniqueValues,
      dataArr
    ) => {
      const returnedDateString = (dateArr) => {
        return (
          "Date(" +
          dateArr[2] +
          ", " +
          (dateArr[0] - 1) +
          ", " +
          Number(dateArr[1]).toString() +
          ", 0, 0, 0, 0)"
        );
      };

      const dateObj = groupBy(dataArr, "date");

      const newArr = [];

      for (const date in dateObj) {
        const dateArr = date ? date.split("/") : null;

        if (generalName === "race") {
          const nameSlicer = (name) =>
            name
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
              .join("/");

          newArr.push(
            [
              returnedDateString(dateArr),
              uniqueValues.map((value) => {
                const formatName = (race) => nameSlicer(race);
                const currentFormattedName = formatName(value);

                return dateObj[date].filter(
                  (x) => nameSlicer(x[generalName]) === currentFormattedName
                ).length;
              }),
            ].flat()
          );
        } else if (generalName === "category") {
          newArr.push(
            [
              returnedDateString(dateArr),
              ["F", "M", "V"].map((value) => {
                const formatName = (x) =>
                  x === "F"
                    ? "Felony"
                    : x === "M"
                    ? "Misdemeanor"
                    : "Violation";

                const currentFormattedName = formatName(value);

                return dateObj[date].filter(
                  (x) => x[generalName] === currentFormattedName
                ).length;
              }),
            ].flat()
          );
        } else if (generalName === "sex") {
          newArr.push(
            [
              returnedDateString(dateArr),
              uniqueValues.map((value) => {
                const formatName = (x) => (x === "F" ? "Female" : "Male");

                const currentFormattedName = formatName(value);

                return dateObj[date].filter(
                  (x) => x[generalName] === currentFormattedName
                ).length;
              }),
            ].flat()
          );
        } else {
          newArr.push(
            [
              returnedDateString(dateArr),
              uniqueValues.map(
                (value) =>
                  dateObj[date].filter((x) => x[generalName] === value).length
              ),
            ].flat()
          );
        }
      }

      return newArr.sort((a, b) => {
        const firstArr = a[0].split(/[(),]+/);
        const firstDate = new Date(...firstArr.slice(1, firstArr.length));

        const secondArr = b[0].split(/[(),]+/);
        const secondDate = new Date(...secondArr.slice(1, secondArr.length));

        return firstDate - secondDate;
      });
    };

    postMessage({
      ageGroupTimelineGraphData: timelineGraphDataReducerFunction(
        "age_group",
        ageObj.unique,
        ageObj.data.flat()
      ),
      raceTimelineGraphData: timelineGraphDataReducerFunction(
        "race",
        raceObj.unique,
        raceObj.data.flat()
      ),
      categoryTimelineGraphData: timelineGraphDataReducerFunction(
        "category",
        categoryObj.unique,
        categoryObj.data.flat()
      ),
      genderTimelineGraphData: timelineGraphDataReducerFunction(
        "sex",
        sexObj.unique,
        sexObj.data.flat()
      ),
      boroughTimelineGraphData: timelineGraphDataReducerFunction(
        "borough",
        boroughObj.unique,
        boroughObj.data.flat()
      ),
    });

    const t1 = performance.now();

    console.log(
      `Timeline graph columns worker performance is ${t1 - t0} milliseconds.`
    );
  }
};
