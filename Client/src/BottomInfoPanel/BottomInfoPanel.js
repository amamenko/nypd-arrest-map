import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FiMinimize2 } from "react-icons/fi";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import "./BottomInfoPanel.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Category from "./CarouselItems/Category/Category";
import AgeGroup from "./CarouselItems/AgeGroup/AgeGroup";
import Race from "./CarouselItems/Race/Race";
import Gender from "./CarouselItems/Gender/Gender";
import Borough from "./CarouselItems/Borough/Borough";
import TopOffenses from "./CarouselItems/TopOffenses/TopOffenses";
import AgeGroupTimeline from "./CarouselItems/AgeGroup/AgeGroupTimeline";
import BoroughTimeline from "./CarouselItems/Borough/BoroughTimeline";
import CategoryTimeline from "./CarouselItems/Category/CategoryTimeline";
import GenderTimeline from "./CarouselItems/Gender/GenderTimeline";
import RaceTimeline from "./CarouselItems/Race/RaceTimeline";
import { RadioGroup, RadioButton } from "react-radio-buttons";
import { useSelector } from "react-redux";
import Tippy from "@tippyjs/react";

const BottomInfoPanel = (props) => {
  const {
    tooltipVisible,
    filteredAgeGroup,
    filteredRaceArr,
    filteredSexArr,
    filteredBoroughArr,
    filteredOffenseDescriptionArr,
    filteredArrestCategory,
    filteredUniqueCategory,

    filteredAgeGroupData,
    filteredRaceUniqueValues,
    filteredSexUniqueValues,
    filteredBoroughUniqueValues,
    filteredOffenseDescriptionUniqueValues,

    currentFilters,
    loadedYears,
    isSame,
    usePrevious,
    graphOption,
    changeGraphOption,
    layersRef,
    initialScreenWidth,
    currentScreenWidth,
    footerMenuActive,
    changeFooterMenuActive,

    filteredTimelineAgeGroupData,
    filteredTimelineBoroughData,
    filteredTimelineCategoryData,
    filteredTimelineSexData,
    filteredTimelineRaceData,
  } = props;

  const loadDataChunks = useSelector(
    (state) => state.loadDataChunksReducer.data
  );

  const trendsAvailable = useSelector(
    (state) => state.trendsAvailableReducer.available
  );

  const [arrowTooltipVisible, changeArrowTooltipVisible] = useState(true);
  const [timelineTooltipVisible, changeTimelineTooltipVisible] = useState(true);

  let CarouselRef = useRef(null);
  let CarouselTimelineRef = useRef(null);

  const rightArrow = document.getElementsByClassName("carousel_right_arrow");
  const aliceCarouselContainer = document.getElementsByClassName(
    "alice-carousel"
  );
  const overviewCarouselContainer = document.getElementsByClassName(
    "overview_carousel"
  );
  const trendsCarouselContainer = document.getElementsByClassName(
    "trends_carousel"
  );
  const categoryTimelineContainer = document.getElementsByClassName(
    "category_timeline_container"
  );
  const googleTooltipContainer = document.getElementsByClassName(
    "google-visualization-tooltip"
  );

  // Hide tooltip when trend dataset is untoggled
  useEffect(() => {
    if (graphOption === "trends") {
      const checkForTooltip = setInterval(() => {
        const tooltip = googleTooltipContainer[0];
        const circles = document.getElementsByTagName("circle");

        if (tooltip) {
          const activePanelContainer = document.getElementsByClassName(
            "alice-carousel__stage-item __active"
          );
          const activePaths = activePanelContainer[1].getElementsByTagName(
            "path"
          );
          const activeText = activePanelContainer[1].getElementsByTagName(
            "text"
          );

          const valuesLength = (activePaths.length - 2) / 2;

          for (let i = 0; i < valuesLength; i++) {
            if (activePaths.item(i).getAttribute("stroke") === "none") {
              if (
                activeText.item(i).textContent.slice(0, 4) ===
                tooltip.lastChild.firstChild.textContent
                  .split(":")[0]
                  .slice(0, 4)
              ) {
                tooltip.style.display = "none";

                for (let j = 0; j < circles.length; j++) {
                  circles[j].style.display = "none";
                }
              }
            }
          }
        } else {
          for (let j = 0; j < circles.length; j++) {
            circles[j].style.display = "block";
          }
        }
      }, 10);

      return () => {
        clearInterval(checkForTooltip);
      };
    }
  }, [googleTooltipContainer, graphOption]);

  useEffect(() => {
    if (graphOption === "overview") {
      if (CarouselTimelineRef.current) {
        CarouselTimelineRef.current.style.display = "none";
      }
    } else {
      if (CarouselRef.current) {
        CarouselRef.current.style.display = "none";
      }
    }
  }, [graphOption]);

  useEffect(() => {
    const graphOptionsContainer = document.getElementsByClassName(
      "graph_options_container"
    )[0];

    const trendsRadioButton = graphOptionsContainer.lastChild.lastChild;

    if (!trendsAvailable) {
      trendsRadioButton.style.opacity = 0.7;
    } else {
      trendsRadioButton.style.opacity = 1;
    }
  }, [trendsAvailable]);

  useEffect(() => {
    for (let i = 0; i < aliceCarouselContainer.length; i++) {
      if (i === 0) {
        if (
          !aliceCarouselContainer[i].className.includes("overview_carousel")
        ) {
          aliceCarouselContainer[i].className += " overview_carousel";
        }
      } else {
        if (!aliceCarouselContainer[i].className.includes("trends_carousel")) {
          aliceCarouselContainer[i].className += " trends_carousel";
        }
      }
    }
  }, [aliceCarouselContainer]);

  useEffect(() => {
    if (graphOption === "overview") {
      overviewCarouselContainer[0].style.opacity = 1;
      overviewCarouselContainer[0].style.zIndex = 1;

      trendsCarouselContainer[0].style.opacity = 0;
      trendsCarouselContainer[0].style.zIndex = -1;
    } else {
      overviewCarouselContainer[0].style.opacity = 0;
      overviewCarouselContainer[0].style.opacity = -1;

      trendsCarouselContainer[0].style.opacity = 1;
      trendsCarouselContainer[0].style.zIndex = 1;
    }
  }, [graphOption, overviewCarouselContainer, trendsCarouselContainer]);

  useEffect(() => {
    if (!currentScreenWidth) {
      if (initialScreenWidth > 768) {
        if (!footerMenuActive) {
          changeFooterMenuActive(true);
        }
      }
    } else {
      if (currentScreenWidth > 768) {
        if (!footerMenuActive) {
          changeFooterMenuActive(true);
        }
      }
    }
  }, [
    footerMenuActive,
    initialScreenWidth,
    currentScreenWidth,
    changeFooterMenuActive,
  ]);

  const handleFooterMenuActive = () => {
    if (footerMenuActive) {
      changeFooterMenuActive(false);
    } else {
      changeFooterMenuActive(true);
    }
  };

  const handleDismissTooltips = () => {
    if (arrowTooltipVisible) {
      changeArrowTooltipVisible(false);
    } else {
      if (graphOption === "trends") {
        if (timelineTooltipVisible) {
          changeTimelineTooltipVisible(false);
        }
      }
    }
  };

  return (
    <div
      className="bottom_info_panel_container"
      style={{
        zIndex: !currentScreenWidth
          ? initialScreenWidth < 768
            ? 10
            : tooltipVisible
            ? -1
            : 0
          : currentScreenWidth < 768
          ? 10
          : tooltipVisible
          ? -1
          : 0,
        transform: !currentScreenWidth
          ? initialScreenWidth < 768
            ? footerMenuActive
              ? "translate3d(0, 0, 0)"
              : "translate3d(0, 100%, 0)"
            : "none"
          : currentScreenWidth < 768
          ? footerMenuActive
            ? "translate3d(0, 0, 0)"
            : "translate3d(0, 100%, 0)"
          : "none",
      }}
    >
      <div
        className="shadow_overlay"
        onClick={() => changeFooterMenuActive(false)}
        style={{
          opacity: footerMenuActive ? 1 : 0,
          display: footerMenuActive ? "block" : "none",
        }}
      >
        {" "}
      </div>
      <div className="footer_menu_trigger" onClick={handleFooterMenuActive}>
        {!footerMenuActive ? (
          <>
            <GoGraph /> VIEW GRAPHS AND TRENDS
          </>
        ) : (
          <>
            <FiMinimize2 /> BACK TO ARREST MAP
          </>
        )}
      </div>
      <div className="bottom_info_main_info_box">
        <div className="filters_applied">
          <h2>Filters Applied</h2>
          {(currentFilters.year.length === 0 ||
            isSame(loadedYears, Object.keys(loadDataChunks[0]))) &&
          currentFilters.category.length === 0 &&
          currentFilters.offense.length === 0 &&
          currentFilters.age.length === 0 &&
          currentFilters.race.length === 0 &&
          currentFilters.sex.length === 0 &&
          currentFilters.borough.length === 0 ? (
            <p className="no_filters_applied_statement">
              No filters currently applied
            </p>
          ) : (
            <>
              <p>
                <strong>
                  {currentFilters.year.length === 0 ||
                  currentFilters.year.length === loadedYears.length
                    ? null
                    : currentFilters.year.length === 1
                    ? "Year: "
                    : "Years: "}
                </strong>
                {currentFilters.year.length === 0 ||
                currentFilters.year.length === loadedYears.length
                  ? null
                  : currentFilters.year.join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.category.length === 0
                    ? null
                    : "Categor" +
                      (currentFilters.category.length > 1 ? "ies: " : "y: ")}
                </strong>
                {currentFilters.category.length === 0
                  ? null
                  : currentFilters.category
                      .map((x) =>
                        x === "F"
                          ? "Felony"
                          : x === "M"
                          ? "Misdemeanor"
                          : "Violation"
                      )
                      .join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.offense.length === 0
                    ? null
                    : "Offense" +
                      (currentFilters.offense.length === 1 ? ": " : "s: ")}
                </strong>
                {currentFilters.offense.length === 0
                  ? null
                  : currentFilters.offense.join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.age.length === 0
                    ? null
                    : "Age" + (currentFilters.age.length === 1 ? ": " : "s: ")}
                </strong>
                {currentFilters.age.length === 0
                  ? null
                  : currentFilters.age
                      .map((x) => (x === "65" ? "65+" : x))
                      .join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.race.length === 0
                    ? null
                    : "Race" +
                      (currentFilters.race.length === 1 ? ": " : "s: ")}
                </strong>
                {currentFilters.race.length === 0
                  ? null
                  : currentFilters.race.join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.sex.length === 0 ? null : "Sex: "}
                </strong>
                {currentFilters.sex.length === 0
                  ? null
                  : currentFilters.sex
                      .map((x) => (x === "M" ? "Male" : "Female"))
                      .join(", ")}
              </p>
              <p>
                <strong>
                  {currentFilters.borough.length === 0
                    ? null
                    : "Borough" +
                      (currentFilters.borough.length === 1 ? ": " : "s: ")}
                </strong>
                {currentFilters.borough.length === 0
                  ? null
                  : currentFilters.borough
                      .map((item) =>
                        item === "B"
                          ? "Bronx"
                          : item === "Q"
                          ? "Queens"
                          : item === "M"
                          ? "Manhattan"
                          : item === "K"
                          ? "Brooklyn"
                          : item === "S"
                          ? "Staten Island"
                          : "Unknown"
                      )
                      .join(", ")}
              </p>
            </>
          )}
        </div>
        <div className="graph_options_container">
          <p>Graph Options</p>
          <RadioGroup
            onChange={(value) => changeGraphOption(value)}
            horizontal
            value={graphOption}
          >
            <RadioButton
              rootColor="rgb(140, 140, 140)"
              pointColor="rgb(0, 0, 128)"
              value="overview"
            >
              Overview
            </RadioButton>
            <RadioButton
              rootColor="rgb(140, 140, 140)"
              pointColor="rgb(0, 0, 128)"
              value="trends"
              disabled={!trendsAvailable}
              disabledColor="rgb(211, 211, 211)"
            >
              Trends
            </RadioButton>
          </RadioGroup>
        </div>
      </div>
      <div className="carousel_container" onTouchStart={handleDismissTooltips}>
        <Tippy
          content="Click the left and right arrows to view more graphs"
          visible={
            footerMenuActive &&
            arrowTooltipVisible &&
            layersRef.current.length > 0 &&
            filteredAgeGroupData.length > 0 &&
            filteredBoroughUniqueValues.length > 0 &&
            filteredArrestCategory.length > 0 &&
            filteredSexUniqueValues.length > 0 &&
            filteredRaceUniqueValues.length > 0
          }
          reference={rightArrow[0]}
          className="burger_tooltip"
          placement="left"
          onClickOutside={() => changeArrowTooltipVisible(false)}
        />
        <FaChevronLeft
          color="rgb(0, 0, 0)"
          className="carousel_left_arrow"
          onClick={() => {
            CarouselRef.slidePrev();
            CarouselTimelineRef.slidePrev();
          }}
        />
        <AliceCarousel
          ref={(el) => (CarouselRef = el)}
          autoPlay={false}
          fadeOutAnimation={true}
          dotsDisabled={true}
          buttonsDisabled={true}
          mouseTrackingEnabled={true}
          playButtonEnabled={false}
          disableAutoPlayOnAction={false}
          responsive={{
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 },
          }}
          preservePosition={true}
          items={[
            <Category
              key="overview"
              filteredArrestCategory={filteredArrestCategory}
              graphOption={graphOption}
            />,
            <AgeGroup
              key="overview"
              filteredAgeGroup={filteredAgeGroup}
              filteredAgeGroupData={filteredAgeGroupData}
              graphOption={graphOption}
            />,
            <Race
              key="overview"
              filteredRaceUniqueValues={filteredRaceUniqueValues}
              filteredRaceArr={filteredRaceArr}
              graphOption={graphOption}
            />,
            <Gender
              key="overview"
              filteredSexUniqueValues={filteredSexUniqueValues}
              filteredSexArr={filteredSexArr}
              graphOption={graphOption}
            />,
            <Borough
              key="overview"
              filteredBoroughUniqueValues={filteredBoroughUniqueValues}
              filteredBoroughArr={filteredBoroughArr}
              graphOption={graphOption}
            />,
            <TopOffenses
              key="overview"
              filteredOffenseDescriptionArr={filteredOffenseDescriptionArr}
              filteredOffenseDescriptionUniqueValues={
                filteredOffenseDescriptionUniqueValues
              }
              graphOption={graphOption}
              isSame={isSame}
              usePrevious={usePrevious}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
          ]}
        />
        <Tippy
          content="Scroll to zoom in and out of trend graphs"
          visible={graphOption === "trends" && timelineTooltipVisible}
          reference={
            categoryTimelineContainer.length > 2
              ? categoryTimelineContainer[1]
              : categoryTimelineContainer[0]
          }
          className="burger_tooltip trend_tooltip"
          placement="top"
          onClickOutside={() => changeTimelineTooltipVisible(false)}
        />
        <Tippy
          content="Toggle data lines by selecting legend items"
          visible={graphOption === "trends" && timelineTooltipVisible}
          reference={
            categoryTimelineContainer.length > 2
              ? categoryTimelineContainer[1]
              : categoryTimelineContainer[0]
          }
          className="burger_tooltip trend_tooltip"
          placement={
            !currentScreenWidth
              ? initialScreenWidth < 768
                ? "left"
                : "right"
              : currentScreenWidth < 768
              ? "left"
              : "right"
          }
          offset={
            !currentScreenWidth
              ? initialScreenWidth < 768
                ? [-30, -180]
                : [0, 50]
              : currentScreenWidth < 768
              ? [-30, -180]
              : [0, 50]
          }
          onClickOutside={() => changeTimelineTooltipVisible(false)}
        />
        <AliceCarousel
          ref={(el) => (CarouselTimelineRef = el)}
          autoPlay={false}
          dotsDisabled={true}
          buttonsDisabled={true}
          mouseTrackingEnabled={false}
          playButtonEnabled={false}
          disableAutoPlayOnAction={false}
          touchMoveDefaultEvents={false}
          responsive={{
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 },
          }}
          preservePosition={true}
          items={[
            <CategoryTimeline
              key="trends"
              filteredTimelineCategoryData={filteredTimelineCategoryData}
              filteredArrestCategory={filteredArrestCategory}
              filteredUniqueCategory={filteredUniqueCategory}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
            <AgeGroupTimeline
              key="trends"
              filteredAgeGroupData={filteredAgeGroupData}
              filteredTimelineAgeGroupData={filteredTimelineAgeGroupData}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
            <BoroughTimeline
              key="trends"
              filteredBoroughUniqueValues={filteredBoroughUniqueValues}
              filteredTimelineBoroughData={filteredTimelineBoroughData}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
            <RaceTimeline
              key="trends"
              filteredRaceUniqueValues={filteredRaceUniqueValues}
              filteredTimelineRaceData={filteredTimelineRaceData}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
            <GenderTimeline
              key="trends"
              filteredSexUniqueValues={filteredSexUniqueValues}
              filteredTimelineSexData={filteredTimelineSexData}
              initialScreenWidth={initialScreenWidth}
              currentScreenWidth={currentScreenWidth}
            />,
          ]}
        />
        <FaChevronRight
          color="rgb(0, 0, 0)"
          className="carousel_right_arrow"
          onClick={() => {
            CarouselRef.slideNext();
            CarouselTimelineRef.slideNext();
          }}
        />
      </div>
    </div>
  );
};

export default BottomInfoPanel;
