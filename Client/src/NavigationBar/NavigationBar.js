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

const NavigationBar = (props) => {
  const {
    loadData,
    raceUniqueValues,
    boroughUniqueValues,
    ageGroupData,
    offenseDescriptionUniqueValues,
    setFilters,
    changeLaddaLoading,
    laddaLoading,
    loadedYears,
    menuClicked,
    changeMenuClicked,
    collapseOpen,
    changeCollapseOpen,
    layersRef,
    filteredAgeGroupData,
    filteredBoroughUniqueValues,
    filteredArrestCategory,
    filteredSexUniqueValues,
    filteredRaceUniqueValues,
    initialScreenWidth,
    currentScreenWidth,
    footerMenuActive,
  } = props;

  const dispatch = useDispatch();

  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );
  const totalCount = useSelector((state) => state.totalCountReducer.total);

  // Filter states
  const categoryFilter = useSelector(
    (state) => state.categoryFilterReducer.category
  );
  const ageFilter = useSelector((state) => state.ageFilterReducer.age);
  const yearFilter = useSelector((state) => state.yearFilterReducer.year);
  const boroughFilter = useSelector(
    (state) => state.boroughFilterReducer.borough
  );
  const sexFilter = useSelector((state) => state.sexFilterReducer.sex);
  const offenseFilter = useSelector(
    (state) => state.offenseFilterReducer.offense
  );
  const raceFilter = useSelector((state) => state.raceFilterReducer.race);

  const logoContainerRef = useRef(null);

  const burgerMenu = document.getElementsByClassName("bm-burger-button");
  const mapboxAttribRef = document.getElementsByClassName(
    "mapboxgl-ctrl-bottom-left"
  );
  const legendTooltip = document.getElementsByClassName(
    "overview_tooltip legend_tooltip"
  );
  const footerMenuTrigger = document.getElementsByClassName(
    "footer_menu_trigger"
  );

  const [tooltipVisible, changeTooltipVisible] = useState(true);

  useEffect(() => {
    if (legendTooltip[0]) {
      let initialTransformValue = "";

      if (footerMenuActive) {
        legendTooltip[0].style.opacity = 0;

        initialTransformValue = legendTooltip[0].parentElement.style.getPropertyValue(
          "transform"
        );
      } else {
        legendTooltip[0].style.opacity = 1;
        legendTooltip[0].parentElement.style.transform = initialTransformValue;
      }
    }
  }, [footerMenuActive, legendTooltip]);

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
      changeTooltipVisible(false);
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

      dispatch(ACTION_CHANGE_CATEGORY_FILTER(copyArr));
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

      dispatch(ACTION_CHANGE_OFFENSE_FILTER(copyArr));
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

      dispatch(ACTION_CHANGE_AGE_FILTER(copyArr));
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

      dispatch(ACTION_CHANGE_RACE_FILTER(copyArr));
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

      dispatch(ACTION_CHANGE_SEX_FILTER(copyArr));
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

      dispatch(ACTION_CHANGE_BOROUGH_FILTER(copyArr));
    }
  };

  useEffect(() => {
    if (!currentScreenWidth) {
      if (initialScreenWidth < 768) {
        if (footerMenuActive) {
          burgerMenu[0].style.opacity = 0.2;
          burgerMenu[0].style.pointerEvents = "none";
          burgerMenu[0].style.transition = "opacity 0.5s ease";
        } else {
          burgerMenu[0].style.opacity = 1;
          burgerMenu[0].style.pointerEvents = "all";
          burgerMenu[0].style.transition = "opacity 0.5s ease";
        }
      } else {
        burgerMenu[0].style.opacity = 1;
        burgerMenu[0].style.pointerEvents = "all";
        burgerMenu[0].style.transition = "opacity 0.5s ease";
      }
    } else {
      if (currentScreenWidth < 768) {
        if (footerMenuActive) {
          burgerMenu[0].style.opacity = 0.2;
          burgerMenu[0].style.pointerEvents = "none";
          burgerMenu[0].style.transition = "opacity 0.5s ease";
        } else {
          burgerMenu[0].style.opacity = 1;
          burgerMenu[0].style.pointerEvents = "all";
          burgerMenu[0].style.transition = "opacity 0.5s ease";
        }
      } else {
        burgerMenu[0].style.opacity = 1;
        burgerMenu[0].style.pointerEvents = "all";
        burgerMenu[0].style.transition = "opacity 0.5s ease";
      }
    }
  }, [footerMenuActive, burgerMenu, currentScreenWidth, initialScreenWidth]);

  return (
    <div className="navigation_bar_container">
      <Tippy
        content={
          <div
            className="overview_tooltip_content"
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
              Data Last Updated: July 22, 2020
            </p>
            <p>
              Showing Arrest Data for{" "}
              <strong>{loadedYears.sort().join(", ")}</strong>
            </p>
            <p>
              Total Number of Arrests Shown: <br />
              <strong>
                {filteredDataChunks.flat().length.toLocaleString()}
              </strong>{" "}
              of <strong>{totalCount.toLocaleString()}</strong>
            </p>
          </div>
        }
        visible={
          layersRef.current.length > 0 &&
          filteredAgeGroupData.length > 0 &&
          filteredBoroughUniqueValues.length > 0 &&
          filteredArrestCategory.length > 0 &&
          filteredSexUniqueValues.length > 0 &&
          filteredRaceUniqueValues.length > 0
        }
        allowHTML={true}
        reference={logoContainerRef.current}
        className="overview_tooltip"
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
          layersRef.current.length > 0 &&
          filteredAgeGroupData.length > 0 &&
          filteredBoroughUniqueValues.length > 0 &&
          filteredArrestCategory.length > 0 &&
          filteredSexUniqueValues.length > 0 &&
          filteredRaceUniqueValues.length > 0
        }
        allowHTML={true}
        reference={
          !currentScreenWidth
            ? initialScreenWidth < 768
              ? footerMenuTrigger[0]
              : mapboxAttribRef[0]
            : currentScreenWidth < 768
            ? footerMenuTrigger[0]
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
          !currentScreenWidth ? (
            initialScreenWidth < 768 ? (
              <p style={{ textAlign: "center" }}>
                Click here <br />
                to set <br />
                data filters
              </p>
            ) : (
              "Click here to set data filters"
            )
          ) : currentScreenWidth < 768 ? (
            <p style={{ textAlign: "center" }}>
              Click here <br />
              to set <br />
              data filters
            </p>
          ) : (
            "Click here to set data filters"
          )
        }
        visible={
          tooltipVisible &&
          layersRef.current.length > 0 &&
          filteredAgeGroupData.length > 0 &&
          filteredBoroughUniqueValues.length > 0 &&
          filteredArrestCategory.length > 0 &&
          filteredSexUniqueValues.length > 0 &&
          filteredRaceUniqueValues.length > 0
        }
        reference={burgerMenu[0]}
        className="burger_tooltip"
        placement="bottom-end"
        onClickOutside={() => changeTooltipVisible(false)}
      />
      <InfoPopUp
        footerMenuActive={footerMenuActive}
        currentScreenWidth={currentScreenWidth}
        initialScreenWidth={initialScreenWidth}
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
          open={collapseOpen === "description"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {!offenseDescriptionUniqueValues ||
            offenseDescriptionUniqueValues.length === 0
              ? null
              : offenseDescriptionUniqueValues.map((desc, i) => {
                  if (
                    desc &&
                    !(desc.includes("OTHER STATE LAWS") && desc.includes("("))
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
              : ageGroupData.map((age, i) => {
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
              : raceUniqueValues.map((race, i) => {
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
              : boroughUniqueValues.map((borough, i) => {
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
        <LaddaButton
          loading={laddaLoading}
          className="apply_filters_button"
          onClick={() => {
            changeLaddaLoading(true);
            setFilters(
              yearFilter,
              categoryFilter,
              offenseFilter,
              ageFilter,
              raceFilter,
              sexFilter,
              boroughFilter,
              loadData,
              false
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
      </Menu>
    </div>
  );
};

export default NavigationBar;
