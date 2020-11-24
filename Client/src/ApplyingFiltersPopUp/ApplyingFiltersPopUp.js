import React, { useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import "react-circular-progressbar/dist/styles.css";
import "./ApplyingFiltersPopUp.css";
import "reactjs-popup/dist/index.css";
import { useSelector } from "react-redux";

const ApplyingFiltersPopUp = (props) => {
  const { applyingFiltersProgressRef } = props;

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
        <ClipLoader
          css={override}
          size={80}
          color={"rgb(0, 109, 129)"}
          style={{ transition: "all 0.5s ease" }}
          loading={true}
        />
        <p>Applying Filters ({applyingFiltersProgressRef.current}% Done)</p>
      </div>
    </Popup>
  );
};

export default ApplyingFiltersPopUp;
