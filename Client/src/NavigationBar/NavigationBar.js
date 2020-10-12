import React, { useEffect, useRef, useState } from "react";
import { slide as Menu } from "react-burger-menu";
import { BsFilterRight } from "react-icons/bs";
import { FaCircle, FaCloudDownloadAlt, FaPlus } from "react-icons/fa";
import Collapsible from "react-collapsible";
import Tippy from "@tippyjs/react";
import LaddaButton, { XL, EXPAND_LEFT } from "react-ladda";
import "tippy.js/dist/tippy.css";
import "./NavigationBar.css";
import "./burgermenu.css";
import InfoPopUp from "./InfoPopUp/InfoPopUp";

const NavigationBar = (props) => {
  const {
    loadData,
    raceUniqueValues,
    boroughUniqueValues,
    ageGroupData,
    offenseDescriptionUniqueValues,
    setFilters,
    initialScreenWidth,
    currentScreenWidth,
    pointClicked,
    changeLaddaLoading,
    laddaLoading,
    loadedYears,
    filteredData,
    handleDownloadYear,
    yearFilter,
    changeYearFilter,
    categoryFilter,
    changeCategoryFilter,
    offenseFilter,
    changeOffenseFilter,
    ageFilter,
    changeAgeFilter,
    raceFilter,
    changeRaceFilter,
    sexFilter,
    changeSexFilter,
    boroughFilter,
    changeBoroughFilter,
  } = props;

  const logoContainerRef = useRef(null);

  const burgerMenu = document.getElementsByClassName("bm-burger-button");
  const mapboxAttribRef = document.getElementsByClassName(
    "mapboxgl-ctrl-bottom-left"
  );
  const [tooltipVisible, changeTooltipVisible] = useState(true);
  const [menuClicked, changeMenuClicked] = useState(false);
  const [collapseOpen, changeCollapseOpen] = useState("");

  const filterByYear = () => {
    return (
      <div className="nav_item">
        <p className="filter_identifier">Filter By Year</p>
        <FaPlus fill={"rgb(0, 109, 129)"} />
      </div>
    );
  };

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

  const renderYears = () => {
    const newArr = [];

    for (let i = 2006; i < Number(new Date().getFullYear() + 1); i++) {
      newArr.push(i);
    }

    return newArr;
  };

  const handleYearFilters = (year) => {
    if (yearFilter.includes(year)) {
      changeYearFilter(yearFilter.filter((item) => item !== year));
    } else {
      const copyArr = yearFilter.slice();
      copyArr.push(year);
      changeYearFilter(copyArr);
    }
  };

  const handleCategoryFilters = (category) => {
    if (categoryFilter.includes(category)) {
      changeCategoryFilter(categoryFilter.filter((item) => item !== category));
    } else {
      const copyArr = categoryFilter.slice();
      copyArr.push(category);
      changeCategoryFilter(copyArr);
    }
  };

  const handleOffenseFilters = (offense) => {
    if (offenseFilter.includes(offense)) {
      changeOffenseFilter(offenseFilter.filter((item) => item !== offense));
    } else {
      const copyArr = offenseFilter.slice();
      copyArr.push(offense);
      changeOffenseFilter(copyArr);
    }
  };

  const handleAgeFilters = (age) => {
    if (ageFilter.includes(age)) {
      changeAgeFilter(ageFilter.filter((item) => item !== age));
    } else {
      const copyArr = ageFilter.slice();
      copyArr.push(age);
      changeAgeFilter(copyArr);
    }
  };

  const handleRaceFilters = (race) => {
    if (raceFilter.includes(race)) {
      changeRaceFilter(raceFilter.filter((item) => item !== race));
    } else {
      const copyArr = raceFilter.slice();
      copyArr.push(race);
      changeRaceFilter(copyArr);
    }
  };

  const handleSexFilters = (sex) => {
    if (sexFilter.includes(sex)) {
      changeSexFilter(sexFilter.filter((item) => item !== sex));
    } else {
      const copyArr = sexFilter.slice();
      copyArr.push(sex);
      changeSexFilter(copyArr);
    }
  };

  const handleBoroughFilters = (borough) => {
    if (boroughFilter.includes(borough)) {
      changeBoroughFilter(boroughFilter.filter((item) => item !== borough));
    } else {
      const copyArr = boroughFilter.slice();
      copyArr.push(borough);
      changeBoroughFilter(copyArr);
    }
  };

  useEffect(() => {
    const overviewTippy = document.getElementById("tippy-4");

    if (!currentScreenWidth) {
      if (initialScreenWidth < 768) {
        if (overviewTippy) {
          if (pointClicked) {
            overviewTippy.style.cssText = "z-index: -1 !important;";
          } else {
            overviewTippy.style.cssText = "z-index: 0 !important;";
          }
        }
      }
    } else {
      if (currentScreenWidth < 768) {
        if (overviewTippy) {
          if (pointClicked) {
            overviewTippy.style.cssText = "z-index: -1 !important;";
          } else {
            overviewTippy.style.cssText = "z-index: 0 !important;";
          }
        }
      }
    }
  }, [pointClicked, currentScreenWidth, initialScreenWidth]);

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
                {filteredData.flat().length.toLocaleString()}
              </strong> of <strong>{loadData.length.toLocaleString()}</strong>
            </p>
          </div>
        }
        visible={typeof loadData === "object" && loadData.flat().length > 70000}
        allowHTML={true}
        reference={
          !currentScreenWidth
            ? initialScreenWidth >= 767
              ? logoContainerRef.current
              : mapboxAttribRef[0]
            : currentScreenWidth >= 767
            ? logoContainerRef.current
            : mapboxAttribRef[0]
        }
        className="overview_tooltip"
        placement="bottom-start"
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
        visible={typeof loadData === "object" && loadData.flat().length > 70000}
        allowHTML={true}
        reference={mapboxAttribRef[0]}
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
        content="Click here to set data filters"
        visible={
          tooltipVisible &&
          typeof loadData === "object" &&
          loadData.flat().length > 70000
        }
        reference={burgerMenu[0]}
        className="burger_tooltip"
        placement="bottom-end"
        onClickOutside={() => changeTooltipVisible(false)}
      />
      <InfoPopUp />
      <Menu
        right
        className="navbar_nav_menu"
        customBurgerIcon={<BsFilterRight color="rgb(93, 188, 210)" />}
        onOpen={handleBurgerMenuClick}
        onClose={() => changeMenuClicked(false)}
        isOpen={menuClicked}
      >
        <Collapsible
          trigger={filterByYear()}
          onTriggerOpening={() => changeCollapseOpen("year")}
          onTriggerClosing={() => changeCollapseOpen("")}
          open={collapseOpen === "year"}
          className="nav_item"
        >
          <div className="nav_item_content_container">
            {renderYears().map((year, i) => {
              return (
                <p
                  key={i}
                  style={{
                    color: loadedYears.includes(year)
                      ? "#000"
                      : "rgb(166, 166, 166)",
                  }}
                  className={
                    loadedYears.includes(year) ? null : "unfetched_year_button"
                  }
                  onClick={() => {
                    if (loadedYears.includes(year)) {
                      handleYearFilters(year);
                    } else {
                      handleDownloadYear(year);
                      changeMenuClicked(false);
                    }
                  }}
                >
                  <label>
                    {loadedYears.includes(year) ? (
                      <input
                        name="my-checkbox"
                        type="checkbox"
                        defaultChecked={loadedYears.includes(year)}
                      />
                    ) : (
                      <FaCloudDownloadAlt className="year_download_icon" />
                    )}
                    {loadedYears.includes(year)
                      ? year
                      : `${year} (Click to load data)`}
                  </label>
                </p>
              );
            })}
          </div>
        </Collapsible>
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
                  onClick={() => handleCategoryFilters("F")}
                />
                Felony
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  onClick={() => handleCategoryFilters("M")}
                />
                Misdemeanor
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  onClick={() => handleCategoryFilters("V")}
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
            {offenseDescriptionUniqueValues.map((desc, i) => {
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
                        onClick={() => handleOffenseFilters(desc)}
                      />
                      {desc
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
            {ageGroupData.map((age, i) => {
              return (
                <p key={i}>
                  <label>
                    <input
                      name="my-checkbox"
                      type="checkbox"
                      onClick={() => handleAgeFilters(age)}
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
            {raceUniqueValues.map((race, i) => {
              if (race) {
                return (
                  <p key={i}>
                    <label>
                      <input
                        name="my-checkbox"
                        type="checkbox"
                        onClick={() => handleRaceFilters(race)}
                      />
                      {race &&
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
                  onClick={() => handleSexFilters("F")}
                />
                Female
              </label>
            </p>
            <p>
              <label>
                <input
                  name="my-checkbox"
                  type="checkbox"
                  onClick={() => handleSexFilters("M")}
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
            {boroughUniqueValues.map((borough, i) => {
              return (
                <p key={i}>
                  <label>
                    <input
                      name="my-checkbox"
                      type="checkbox"
                      onClick={() => handleBoroughFilters(borough)}
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
      </Menu>
    </div>
  );
};

export default NavigationBar;
