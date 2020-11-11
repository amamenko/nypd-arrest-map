import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  let CarouselRef = useRef(null);
  let CarouselTimelineRef = useRef(null);

  const rightArrow = document.getElementsByClassName("carousel_right_arrow");

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

  return (
    <div
      className="bottom_info_panel_container"
      style={{ zIndex: tooltipVisible ? -1 : 0 }}
    >
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
      <div className="carousel_container">
        <Tippy
          content="Click the left and right arrows to view more graphs"
          visible={
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
            1600: { items: 4 },
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
            />,
          ]}
        />
        <AliceCarousel
          ref={(el) => (CarouselTimelineRef = el)}
          autoPlay={false}
          fadeOutAnimation={true}
          dotsDisabled={true}
          buttonsDisabled={true}
          mouseTrackingEnabled={false}
          playButtonEnabled={false}
          disableAutoPlayOnAction={false}
          responsive={{
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 },
            1600: { items: 4 },
          }}
          preservePosition={true}
          items={[
            <CategoryTimeline
              key="trends"
              filteredTimelineCategoryData={filteredTimelineCategoryData}
              filteredArrestCategory={filteredArrestCategory}
              graphOption={graphOption}
              filteredUniqueCategory={filteredUniqueCategory}
            />,
            <AgeGroupTimeline
              key="trends"
              filteredAgeGroupData={filteredAgeGroupData}
              filteredTimelineAgeGroupData={filteredTimelineAgeGroupData}
              graphOption={graphOption}
            />,
            <BoroughTimeline
              key="trends"
              filteredBoroughUniqueValues={filteredBoroughUniqueValues}
              filteredTimelineBoroughData={filteredTimelineBoroughData}
              graphOption={graphOption}
            />,
            <RaceTimeline
              key="trends"
              filteredRaceUniqueValues={filteredRaceUniqueValues}
              filteredTimelineRaceData={filteredTimelineRaceData}
              graphOption={graphOption}
            />,
            <GenderTimeline
              key="trends"
              filteredSexUniqueValues={filteredSexUniqueValues}
              filteredTimelineSexData={filteredTimelineSexData}
              graphOption={graphOption}
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
