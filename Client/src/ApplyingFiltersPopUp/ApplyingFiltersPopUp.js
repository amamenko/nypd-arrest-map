import React, { useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import GridLoader from "react-spinners/GridLoader";
import { css } from "@emotion/core";
import "react-circular-progressbar/dist/styles.css";
import "./ApplyingFiltersPopUp.css";
import "reactjs-popup/dist/index.css";
import { useSelector } from "react-redux";

const ApplyingFiltersPopUp = (props) => {
  const applyingFiltersRef = useRef(null);

  const override = css`
    display: block;
    margin: 0 auto;
  `;

  const applyingFilters = useSelector(
    (state) => state.applyingFiltersReducer.filters
  );

  useEffect(() => {
    if (applyingFiltersRef) {
      if (applyingFiltersRef.current) {
        if (applyingFilters) {
          applyingFiltersRef.current.open();
        } else {
          applyingFiltersRef.current.close();
        }
      }
    }
  }, [applyingFilters]);

  return (
    <Popup
      className="applying_filters"
      ref={applyingFiltersRef}
      modal
      closeOnDocumentClick={false}
      closeOnEscape={false}
    >
      <div className="applying_filters_modal">
        <GridLoader
          css={override}
          size={50}
          color={"#0044cb"}
          style={{ transition: "all 0.5s ease" }}
          loading={true}
        />
        <p>Applying Filters</p>
      </div>
    </Popup>
  );
};

export default ApplyingFiltersPopUp;
