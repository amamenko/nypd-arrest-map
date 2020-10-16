import React from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { GiHandcuffs } from "react-icons/gi";
import GridLoader from "react-spinners/GridLoader";
import { css } from "@emotion/core";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";

const InitialLoader = (props) => {
  const { fetchProgress, countUp, loaderColor, mapError } = props;

  const override = css`
    display: block;
    margin: 0 auto;
  `;

  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );

  return (
    <div className="loading_container">
      {fetchProgress === 0 ? (
        <GridLoader
          css={override}
          size={50}
          color={loaderColor}
          style={{ transition: "all 0.5s ease" }}
          loading={
            filteredDataChunks === "" ||
            (typeof filteredDataChunks === "object" &&
              filteredDataChunks.flat().length < 70000)
          }
        />
      ) : (
        <CircularProgressbarWithChildren
          value={countUp}
          styles={buildStyles({
            strokeLinecap: "butt",
            trailColor: "#eee",
          })}
        >
          <GiHandcuffs color="#fff" size="4rem" />
          <div style={{ fontSize: 30, marginTop: 20, color: "#fff" }}>
            <strong>{countUp}%</strong>
          </div>
        </CircularProgressbarWithChildren>
      )}
      <p>
        {mapError
          ? "Error Initializing NYPD Arrest Map"
          : fetchProgress === 0
          ? "Initializing NYPD Arrest Map"
          : countUp >= 60
          ? "Rendering NYPD Arrest Map"
          : "Loading Most Recent Arrest Data"}
      </p>
    </div>
  );
};

export default InitialLoader;
