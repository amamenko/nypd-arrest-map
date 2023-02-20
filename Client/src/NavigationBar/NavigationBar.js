import React, { useEffect, useRef, useState } from "react";
import { slide as Menu } from "react-burger-menu";
import { BsFilterRight } from "react-icons/bs";
import { FaCircle, FaPlus } from "react-icons/fa";
import Collapsible from "react-collapsible";
import Tippy from "@tippyjs/react";
import LaddaButton, { XL, EXPAND_LEFT } from "react-ladda";
import "tippy.js/dist/tippy.css";
import "./NavigationBar.css";
import "./burgermenu.css";
import InfoPopUp from "./InfoPopUp/InfoPopUp";
import { useSelector, useDispatch } from "react-redux";
import ACTION_CHANGE_CATEGORY_FILTER from "../actions/filters/category/ACTION_CHANGE_CATEGORY_FILTER";
import ACTION_CHANGE_OFFENSE_FILTER from "../actions/filters/offense/ACTION_CHANGE_OFFENSE_FILTER";
import ACTION_CHANGE_AGE_FILTER from "../actions/filters/age/ACTION_CHANGE_AGE_FILTER";
import ACTION_CHANGE_RACE_FILTER from "../actions/filters/race/ACTION_CHANGE_RACE_FILTER";
import ACTION_CHANGE_SEX_FILTER from "../actions/filters/sex/ACTION_CHANGE_SEX_FILTER";
import ACTION_CHANGE_BOROUGH_FILTER from "../actions/filters/borough/ACTION_CHANGE_BOROUGH_FILTER";
import ACTION_APPLYING_FILTERS from "../actions/applyingFilters/ACTION_APPLYING_FILTERS";
import ACTION_RESET_FILTERS from "../actions/resetFilters/ACTION_RESET_FILTERS";

const NavigationBar = (props) => {
  const {
    yearlyTotals,
    loadData,
    raceUniqueValues,
    boroughUniqueValues,
    ageGroupData,
    offenseDescriptionUniqueValues,
    setFilters,
    changeLaddaLoading,
    laddaLoading,
    resetLaddaLoading,
    changeResetLaddaLoading,
    menuClicked,
    changeMenuClicked,
    collapseOpen,
    changeCollapseOpen,
    layersRef,
    isMobileOrTablet,
    footerMenuActive,
    isTablet,
    currentFilters,
    isSame,
    mapVisible,
  } = props;

  const dispatch = useDispatch();

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );
  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );
  const totalCount = useSelector((state) => state.totalCountReducer.total);

  // Filter states
  const categoryFilter = useSelector(
    (state) => state.categoryFilterReducer.category
  );
  const ageFilter = useSelector((state) => state.ageFilterReducer.age);
  const boroughFilter = useSelector(
    (state) => state.boroughFilterReducer.borough
  );
  const sexFilter = useSelector((state) => state.sexFilterReducer.sex);
  const offenseFilter = useSelector(
    (state) => state.offenseFilterReducer.offense
  );
  const raceFilter = useSelector((state) => state.raceFilterReducer.race);
  const resetFilters = useSelector((state) => state.resetFiltersReducer.reset);

  // Timeline Column Data
  const ageTimelineColumns = useSelector(
    (state) => state.ageTimelineColumnsReducer.columns
  );
  const boroughTimelineColumns = useSelector(
    (state) => state.boroughTimelineColumnsReducer.columns
  );
  const categoryTimelineColumns = useSelector(
    (state) => state.categoryTimelineColumnsReducer.columns
  );
  const raceTimelineColumns = useSelector(
    (state) => state.raceTimelineColumnsReducer.columns
  );
  const sexTimelineColumns = useSelector(
    (state) => state.sexTimelineColumnsReducer.columns
  );

  const logoContainerRef = useRef(null);

  const burgerMenu = document.getElementsByClassName("bm-burger-button");
  const mapboxAttribRef = document.getElementsByClassName(
    "mapboxgl-ctrl-bottom-left"
  );
  const footerMenuTrigger = document.getElementsByClassName(
    "footer_menu_trigger"
  );
  const overviewTip = document.getElementsByClassName("overview_tooltip");
  const mapDetailsTip = document.getElementsByClassName(
    "map_details_tooltip_container"
  );
  const mapLegend = document.getElementsByClassName(
    "overview_tooltip legend_tooltip"
  );
  const resetFiltersButton = document.getElementsByClassName(
    "reset_filters_button"
  );
  const applyFiltersButton = document.getElementsByClassName(
    "apply_filters_button"
  );

  const [tooltipVisible, changeTooltipVisible] = useState(true);

  const filterByCategory = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Category</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const filterByOffense = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Offense</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const filterByAge = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Age Group</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const filterByRace = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Race</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const filterBySex = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Sex</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const filterByBorough = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Borough</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

  const handleBurgerMenuClick = () => {
    if (menuClicked) {
      changeMenuClicked(false);
    } else {
      changeMenuClicked(true);
      if (tooltipVisible) {
        changeTooltipVisible(false);
      }
    }
  };

  const handleCategoryFilters = (category) => {
    if (categoryFilter.includes(category)) {
      dispatch(
        ACTION_CHANGE_CATEGORY_FILTER(
          categoryFilter.filter((item) => item !== category)
        )
      );
    } else {
      const copyArr = categoryFilter.slice();
      copyArr.push(category);

      // If all category options are selected, reset all fields
      if (isSame(copyArr.sort(), ["F", "M", "V"].sort())) {
        dispatch(ACTION_CHANGE_CATEGORY_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_CATEGORY_FILTER(copyArr));
      }
    }
  };

  const handleOffenseFilters = (offense) => {
    if (offenseFilter.includes(offense)) {
      dispatch(
        ACTION_CHANGE_OFFENSE_FILTER(
          offenseFilter.filter((item) => item !== offense)
        )
      );
    } else {
      const copyArr = offenseFilter.slice();
      copyArr.push(offense);

      const descUnique = offenseDescriptionUniqueValues
        .sort()
        .filter(
          (desc) =>
            desc && !(desc.includes("OTHER STATE LAWS") && desc.includes("("))
        );

      // If all offense description options are selected, reset all fields
      if (isSame(copyArr.sort(), descUnique.sort())) {
        dispatch(ACTION_CHANGE_OFFENSE_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_OFFENSE_FILTER(copyArr));
      }
    }
  };

  const handleAgeFilters = (age) => {
    if (ageFilter.includes(age)) {
      dispatch(
        ACTION_CHANGE_AGE_FILTER(ageFilter.filter((item) => item !== age))
      );
    } else {
      const copyArr = ageFilter.slice();
      copyArr.push(age);

      const uniqueAge = ageGroupData.sort((a, b) => a.localeCompare(b));

      // If all age options are selected, reset all fields
      if (
        isSame(
          copyArr.sort((a, b) => a.localeCompare(b)),
          uniqueAge
        )
      ) {
        dispatch(ACTION_CHANGE_AGE_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_AGE_FILTER(copyArr));
      }
    }
  };

  const handleRaceFilters = (race) => {
    if (raceFilter.includes(race)) {
      dispatch(
        ACTION_CHANGE_RACE_FILTER(raceFilter.filter((item) => item !== race))
      );
    } else {
      const copyArr = raceFilter.slice();
      copyArr.push(race);

      const uniqueRace = raceUniqueValues.sort();

      // If all race options are selected, reset all fields
      if (isSame(copyArr, uniqueRace)) {
        dispatch(ACTION_CHANGE_RACE_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_RACE_FILTER(copyArr));
      }
    }
  };

  const handleSexFilters = (sex) => {
    if (sexFilter.includes(sex)) {
      dispatch(
        ACTION_CHANGE_SEX_FILTER(sexFilter.filter((item) => item !== sex))
      );
    } else {
      const copyArr = sexFilter.slice();
      copyArr.push(sex);

      // If all sex options are selected, reset all fields
      if (isSame(copyArr.sort(), ["F", "M"].sort())) {
        dispatch(ACTION_CHANGE_SEX_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_SEX_FILTER(copyArr));
      }
    }
  };

  const handleBoroughFilters = (borough) => {
    if (boroughFilter.includes(borough)) {
      dispatch(
        ACTION_CHANGE_BOROUGH_FILTER(
          boroughFilter.filter((item) => item !== borough)
        )
      );
    } else {
      const copyArr = boroughFilter.slice();
      copyArr.push(borough);

      const uniqueBorough = boroughUniqueValues.sort();

      // If all borough options are selected, reset all fields
      if (isSame(copyArr, uniqueBorough)) {
        dispatch(ACTION_CHANGE_BOROUGH_FILTER([]));
      } else {
        dispatch(ACTION_CHANGE_BOROUGH_FILTER(copyArr));
      }
    }
  };

  useEffect(() => {
    if (footerMenuActive) {
      burgerMenu[0].style.opacity = 0.2;
      burgerMenu[0].style.pointerEvents = "none";
      burgerMenu[0].style.transition = "opacity 0.5s ease";

      if (overviewTip[0] && mapDetailsTip[0]) {
        overviewTip[0].style.setProperty("opacity", 0.4, "important");
        overviewTip[0].style.setProperty("pointerEvents", "none");
        overviewTip[0].style.setProperty("transition", "opacity 0.5s ease");

        mapDetailsTip[0].style.setProperty("opacity", 0.4, "important");
        mapDetailsTip[0].style.setProperty("pointerEvents", "none");
        mapDetailsTip[0].style.setProperty("transition", "opacity 0.5s ease");
      }

      if (mapLegend[0]) {
        mapLegend[0].style.setProperty("opacity", 0.4, "important");
        mapLegend[0].style.setProperty("pointerEvents", "none");
        mapLegend[0].style.setProperty("transition", "opacity 0.5s ease");
      }
    } else {
      burgerMenu[0].style.opacity = 1;
      burgerMenu[0].style.pointerEvents = "all";
      burgerMenu[0].style.transition = "opacity 0.5s ease";

      if (overviewTip[0] && mapDetailsTip[0]) {
        overviewTip[0].style.setProperty("opacity", 1, "important");
        overviewTip[0].style.setProperty("pointerEvents", "all");
        overviewTip[0].style.setProperty("transition", "opacity 0.5s ease");

        mapDetailsTip[0].style.setProperty("opacity", 1, "important");
        mapDetailsTip[0].style.setProperty("pointerEvents", "all");
        mapDetailsTip[0].style.setProperty("transition", "opacity 0.5s ease");
      }

      if (mapLegend[0]) {
        mapLegend[0].style.setProperty("opacity", 1, "important");
        mapLegend[0].style.setProperty("pointerEvents", "all");
        mapLegend[0].style.setProperty("transition", "opacity 0.5s ease");
      }
    }
  }, [
    footerMenuActive,
    burgerMenu,
    isMobileOrTablet,
    mapDetailsTip,
    overviewTip,
    mapLegend,
  ]);

  useEffect(() => {
    if (isMobileOrTablet) {
      setTimeout(() => {
        console.log("RUNNING");
        const opacityTip = document.getElementById("overview_tooltip");
        if (mapVisible && opacityTip) {
          changeTooltipVisible(false);
          opacityTip.style.setProperty("opacity", 1, "important");
        }
      }, 25000);
    }
  }, [
    isMobileOrTablet,
    tooltipVisible,
    mapVisible,
    mapDetailsTip,
    overviewTip,
  ]);

  useEffect(() => {
    if (!tooltipVisible) {
      if (overviewTip[0] && mapDetailsTip[0]) {
        overviewTip[0].style.setProperty("opacity", 1, "important");
        mapDetailsTip[0].style.setProperty("opacity", 1, "important");
      }

      if (mapLegend[0]) {
        mapLegend[0].style.setProperty("opacity", 1, "important");
      }
    }
  }, [tooltipVisible, overviewTip, mapDetailsTip, mapLegend]);

  useEffect(() => {
    if (!isMobileOrTablet) {
      if (menuClicked) {
        if (overviewTip[0] && mapDetailsTip[0]) {
          overviewTip[0].style.setProperty("opacity", 0.3, "important");
          mapDetailsTip[0].style.setProperty("opacity", 0.3, "important");
        }

        if (mapLegend[0]) {
          mapLegend[0].style.setProperty("opacity", 0.3, "important");
        }
      } else {
        if (overviewTip[0] && mapDetailsTip[0]) {
          overviewTip[0].style.setProperty("opacity", 1, "important");
          mapDetailsTip[0].style.setProperty("opacity", 1, "important");
        }

        if (mapLegend[0]) {
          mapLegend[0].style.setProperty("opacity", 1, "important");
        }
      }
    }
  }, [isMobileOrTablet, mapLegend, menuClicked, mapDetailsTip, overviewTip]);

  useEffect(() => {
    if (!menuClicked) {
      const filterMenu = document.getElementsByClassName("bm-menu");
      const scrollContainers = document.getElementsByClassName(
        "nav_item_content_container"
      );

      setTimeout(() => {
        if (filterMenu[0]) {
          filterMenu[0].scrollTop = 0;
        }

        for (let i = 0; i < scrollContainers.length; i++) {
          scrollContainers[i].scrollTop = 0;
        }
      }, 800);

      if (collapseOpen !== "") {
        changeCollapseOpen("");
      }
    }
  }, [menuClicked, collapseOpen, changeCollapseOpen]);

  useEffect(() => {
    if (
      currentFilters.category.length === 0 &&
      currentFilters.offense.length === 0 &&
      currentFilters.age.length === 0 &&
      currentFilters.race.length === 0 &&
      currentFilters.sex.length === 0 &&
      currentFilters.borough.length === 0
    ) {
      if (resetFiltersButton[0]) {
        resetFiltersButton[0].style.opacity = 0.4;
        resetFiltersButton[0].style.pointerEvents = "none";
      }
    } else {
      if (resetFiltersButton[0]) {
        resetFiltersButton[0].style.opacity = 1;
        resetFiltersButton[0].style.pointerEvents = "auto";
      }
    }
  }, [
    currentFilters.age.length,
    currentFilters.borough.length,
    currentFilters.category.length,
    currentFilters.offense.length,
    currentFilters.race.length,
    currentFilters.sex.length,
    resetFiltersButton,
  ]);

  useEffect(() => {
    if (
      isSame(currentFilters.category, categoryFilter) &&
      isSame(currentFilters.offense, offenseFilter) &&
      isSame(currentFilters.age, ageFilter) &&
      isSame(currentFilters.race, raceFilter) &&
      isSame(currentFilters.sex, sexFilter) &&
      isSame(currentFilters.borough, boroughFilter)
    ) {
      if (applyFiltersButton[0]) {
        applyFiltersButton[0].style.opacity = 0.4;
        applyFiltersButton[0].style.pointerEvents = "none";
      }
    } else {
      if (applyFiltersButton[0]) {
        applyFiltersButton[0].style.opacity = 1;
        applyFiltersButton[0].style.pointerEvents = "auto";
      }
    }
  }, [
    currentFilters.age,
    currentFilters.borough,
    currentFilters.category,
    currentFilters.offense,
    currentFilters.race,
    currentFilters.sex,
    ageFilter,
    boroughFilter,
    categoryFilter,
    offenseFilter,
    raceFilter,
    sexFilter,
    applyFiltersButton,
    isSame,
  ]);

  const handleOffenseDescriptionCollapseClosing = () => {
    const scrollContainers = document.getElementsByClassName(
      "nav_item_content_container"
    );

    setTimeout(() => {
      for (let i = 0; i < scrollContainers.length; i++) {
        scrollContainers[i].scrollTop = 0;
      }
    }, 800);
  };

  return (
    <div className="navigation_bar_container">
      <Tippy
        content={
          <div className="map_details_tooltip_container">
            <div
              className="overview_tooltip_content"
              placement="bottom-start"
              style={{
                minWidth:
                  logoContainerRef.current &&
                  logoContainerRef.current.clientWidth,
                maxWidth:
                  logoContainerRef.current &&
                  logoContainerRef.current.clientWidth,
              }}
            >
              <p style={{ color: "rgb(166, 166, 166)" }}>
                Data Last Updated: <br />
                {yearlyTotals["lastUpdatedDate"]}
              </p>
              <p>
                Total Number of Arrests Shown: <br />
                <strong>
                  {filteredDataChunks.flat().length.toLocaleString()}
                </strong>{" "}
                of <strong>{totalCount.toLocaleString()}</strong>
              </p>
            </div>
            {isMobileOrTablet ? (
              isTablet ? null : (
                <div
                  className="map_legend_container"
                  style={{
                    minWidth:
                      logoContainerRef.current &&
                      logoContainerRef.current.clientWidth,
                    maxWidth:
                      logoContainerRef.current &&
                      logoContainerRef.current.clientWidth,
                  }}
                >
                  <p>Map Legend</p>
                  <div className="map_legend_items_container">
                    <div className="map_legend_element">
                      <FaCircle color="rgb(255, 0, 0)" />
                      <p>Felony</p>
                    </div>
                    <div className="map_legend_element">
                      <FaCircle color="rgb(255, 116, 0)" />
                      <p>Misdemeanor</p>
                    </div>
                    <div className="map_legend_element">
                      <FaCircle color="rgb(255, 193, 0)" />
                      <p>Violation</p>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        }
        visible={layersRef.current.length > 0 && mapVisible}
        allowHTML={true}
        reference={logoContainerRef.current}
        className="overview_tooltip"
        id="overview_tooltip"
      />
      <Tippy
        content={
          <div
            className="map_legend_container"
            style={{
              minWidth:
                logoContainerRef.current &&
                logoContainerRef.current.clientWidth,
              maxWidth:
                logoContainerRef.current &&
                logoContainerRef.current.clientWidth,
            }}
          >
            <p>Map Legend</p>
            <div className="map_legend_items_container">
              <div className="map_legend_element">
                <FaCircle color="rgb(255, 0, 0)" />
                <p>Felony</p>
              </div>
              <div className="map_legend_element">
                <FaCircle color="rgb(255, 116, 0)" />
                <p>Misdemeanor</p>
              </div>
              <div className="map_legend_element">
                <FaCircle color="rgb(255, 193, 0)" />
                <p>Violation</p>
              </div>
            </div>
          </div>
        }
        visible={
          isMobileOrTablet
            ? isTablet
              ? layersRef.current.length > 0 &&
                (ageTimelineColumns ? ageTimelineColumns.length > 0 : false) &&
                (boroughTimelineColumns
                  ? boroughTimelineColumns.length > 0
                  : false) &&
                (categoryTimelineColumns
                  ? categoryTimelineColumns.length > 0
                  : false) &&
                (raceTimelineColumns
                  ? raceTimelineColumns.length > 0
                  : false) &&
                (sexTimelineColumns ? sexTimelineColumns.length > 0 : false)
              : false
            : layersRef.current.length > 0 &&
              (ageTimelineColumns ? ageTimelineColumns.length > 0 : false) &&
              (boroughTimelineColumns
                ? boroughTimelineColumns.length > 0
                : false) &&
              (categoryTimelineColumns
                ? categoryTimelineColumns.length > 0
                : false) &&
              (raceTimelineColumns ? raceTimelineColumns.length > 0 : false) &&
              (sexTimelineColumns ? sexTimelineColumns.length > 0 : false)
        }
        allowHTML={true}
        reference={
          isMobileOrTablet
            ? isTablet
              ? burgerMenu[0]
              : footerMenuTrigger[0]
            : mapboxAttribRef[0]
        }
        className="overview_tooltip legend_tooltip"
        placement="top-start"
      />
      <div className="nypd_arrest_map_logo_container" ref={logoContainerRef}>
        <a href="/">
          <p>NYPD</p>
          <p>Arrest</p>
          <p>Map</p>
        </a>
      </div>
      <Tippy
        content={
          isMobileOrTablet ? (
            <p style={{ textAlign: "center" }}>
              Click here <br />
              to set <br />
              data filters
            </p>
          ) : (
            "Click here to set data filters"
          )
        }
        duration={[null, 500]}
        arrow={true}
        visible={tooltipVisible && mapVisible}
        reference={burgerMenu[0]}
        className="burger_tooltip"
        placement="bottom-end"
        onClickOutside={() => changeTooltipVisible(false)}
      />
      <InfoPopUp
        footerMenuActive={footerMenuActive}
        isMobileOrTablet={isMobileOrTablet}
      />
      <Menu
        right
        className="navbar_nav_menu"
        customBurgerIcon={<BsFilterRight color="rgb(93, 188, 210)" />}
        onOpen={handleBurgerMenuClick}
        onClose={() => changeMenuClicked(false)}
        isOpen={menuClicked}
      >
        <Collapsible
          trigger={filterByCategory()}
          onTriggerOpening={() => changeCollapseOpen("category")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "category"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  checked={categoryFilter.includes("F")}
                  onChange={() => handleCategoryFilters("F")}
                />
                Felony
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  checked={categoryFilter.includes("M")}
                  onChange={() => handleCategoryFilters("M")}
                />
                Misdemeanor
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  checked={categoryFilter.includes("V")}
                  onChange={() => handleCategoryFilters("V")}
                />
                Violation
              </label>
            </p>
          </div>
        </Collapsible>
        <Collapsible
          trigger={filterByOffense()}
          onTriggerOpening={() => changeCollapseOpen("description")}
          onTriggerClosing={() => changeCollapseOpen("")}
          onClose={handleOffenseDescriptionCollapseClosing}
          open={collapseOpen === "description"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {!offenseDescriptionUniqueValues ||
            offenseDescriptionUniqueValues.length === 0
              ? null
              : offenseDescriptionUniqueValues.sort().map((desc, i) => {
                  if (
                    desc &&
                    !desc.includes("OTHER STATE LAWS") &&
                    !(desc.includes("null") && desc.includes("("))
                  ) {
                    return (
                      <p key={i}>
                        <label>
                          <input
                            name="my-checkbox"
                            type="checkbox"
                            checked={offenseFilter.includes(desc)}
                            onChange={() => handleOffenseFilters(desc)}
                          />
                          {desc
                            .split(" ")
                            .map(
                              (x) =>
                                x[0].toUpperCase() + x.slice(1).toLowerCase()
                            )
                            .join(" ")
                            .split("/")
                            .map(
                              (x) =>
                                x[0].toUpperCase() +
                                x.slice(1, x.indexOf(" ")).toLowerCase() +
                                x.slice(x.indexOf(" "))
                            )
                            .join("/")}
                        </label>
                      </p>
                    );
                  } else {
                    return null;
                  }
                })}
          </div>
        </Collapsible>
        <Collapsible
          trigger={filterByAge()}
          onTriggerOpening={() => changeCollapseOpen("age")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "age"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {!ageGroupData
              ? null
              : ageGroupData
                  .sort((a, b) => a.localeCompare(b))
                  .map((age, i) => {
                    return (
                      <p key={i}>
                        <label>
                          <input
                            name="my-checkbox"
                            type="checkbox"
                            checked={ageFilter.includes(age)}
                            onChange={() => handleAgeFilters(age)}
                          />
                          {age === "65" ? "65+" : age}
                        </label>
                      </p>
                    );
                  })}
          </div>
        </Collapsible>
        <Collapsible
          trigger={filterByRace()}
          onTriggerOpening={() => changeCollapseOpen("race")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "race"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {!raceUniqueValues
              ? null
              : raceUniqueValues.sort().map((race, i) => {
                  if (race) {
                    return (
                      <p key={i}>
                        <label>
                          <input
                            name="my-checkbox"
                            type="checkbox"
                            checked={raceFilter.includes(race)}
                            onChange={() => handleRaceFilters(race)}
                          />
                          {race &&
                            race
                              .split(" ")
                              .map(
                                (x) =>
                                  x[0].toUpperCase() + x.slice(1).toLowerCase()
                              )
                              .join(" ")
                              .split("/")
                              .map(
                                (x) =>
                                  x[0].toUpperCase() +
                                  x.slice(1, x.indexOf(" ")).toLowerCase() +
                                  x.slice(x.indexOf(" "))
                              )
                              .join("/")}
                        </label>
                      </p>
                    );
                  } else {
                    return null;
                  }
                })}
          </div>
        </Collapsible>
        <Collapsible
          trigger={filterBySex()}
          onTriggerOpening={() => changeCollapseOpen("sex")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "sex"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  checked={sexFilter.includes("F")}
                  onChange={() => handleSexFilters("F")}
                />
                Female
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  checked={sexFilter.includes("M")}
                  onChange={() => handleSexFilters("M")}
                />
                Male
              </label>
            </p>
          </div>
        </Collapsible>
        <Collapsible
          trigger={filterByBorough()}
          onTriggerOpening={() => changeCollapseOpen("borough")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "borough"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {!boroughUniqueValues
              ? null
              : boroughUniqueValues.sort().map((borough, i) => {
                  return (
                    <p key={i}>
                      <label>
                        <input
                          name="my-checkbox"
                          type="checkbox"
                          checked={boroughFilter.includes(borough)}
                          onChange={() => handleBoroughFilters(borough)}
                        />
                        {borough === "B"
                          ? "Bronx"
                          : borough === "Q"
                          ? "Queens"
                          : borough === "M"
                          ? "Manhattan"
                          : borough === "K"
                          ? "Brooklyn"
                          : borough === "S"
                          ? "Staten Island"
                          : "Unknown"}
                      </label>
                    </p>
                  );
                })}
          </div>
        </Collapsible>
        <span className="spacer" />
        <div className="filter_buttons_container">
          <LaddaButton
            loading={laddaLoading}
            className="apply_filters_button"
            onClick={() => {
              if (!applyingFilters) {
                dispatch(ACTION_APPLYING_FILTERS());
              }

              if (!laddaLoading) {
                changeLaddaLoading(true);
              }

              setFilters(
                categoryFilter,
                offenseFilter,
                ageFilter,
                raceFilter,
                sexFilter,
                boroughFilter,
                loadData
              );
            }}
            data-color={"blue"}
            data-size={XL}
            data-style={EXPAND_LEFT}
            data-spinner-size={30}
            data-spinner-color={"#fff"}
            data-spinner-lines={12}
          >
            {laddaLoading ? "APPLYING FILTERS" : "APPLY FILTERS"}
          </LaddaButton>
          <LaddaButton
            loading={resetLaddaLoading}
            className="reset_filters_button"
            onClick={() => {
              if (!resetFilters) {
                dispatch(ACTION_RESET_FILTERS());
              }

              if (!resetLaddaLoading) {
                changeResetLaddaLoading(true);
              }

              dispatch(ACTION_CHANGE_CATEGORY_FILTER([]));
              dispatch(ACTION_CHANGE_OFFENSE_FILTER([]));
              dispatch(ACTION_CHANGE_AGE_FILTER([]));
              dispatch(ACTION_CHANGE_RACE_FILTER([]));
              dispatch(ACTION_CHANGE_SEX_FILTER([]));
              dispatch(ACTION_CHANGE_BOROUGH_FILTER([]));

              setFilters([], [], [], [], [], [], loadData);
            }}
            data-color={"red"}
            data-size={XL}
            data-style={EXPAND_LEFT}
            data-spinner-size={30}
            data-spinner-color={"#fff"}
            data-spinner-lines={12}
          >
            {resetLaddaLoading ? "RESETTING" : "RESET FILTERS"}
          </LaddaButton>
        </div>
      </Menu>
    </div>
  );
};

export default NavigationBar;
