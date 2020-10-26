import React, { useEffect, useState } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { GiHandcuffs } from "react-icons/gi";
import "react-circular-progressbar/dist/styles.css";
import Modal from "react-modal";
import yearlyTotals from "./YearlyTotals";
import { useSelector } from "react-redux";

const SubsequentLoader = (props) => {
  const { modalActive, changeModalActive, loadedYears } = props;

  const loadDataChunks = useSelector(
    (state) => state.loadDataChunksReducer.data
  );
  const filteredDataChunks = useSelector(
    (state) => state.filteredDataChunksReducer.data
  );

  const [newProgress, changeNewProgress] = useState(0);

  useEffect(() => {
    if (loadDataChunks[0][modalActive.year.toString()]) {
      const progress =
        Number(
          loadDataChunks[0][modalActive.year.toString()]
            .map((x) => x.length)
            .reduce((a, b) => a + b, 0) /
            yearlyTotals[modalActive.year.toString()]
        ).toFixed(1) * 100;

      if (
        newProgress === 100 &&
        filteredDataChunks.length === loadedYears.length
      ) {
        changeModalActive({ active: false, year: null });
      } else {
        if (progress && progress !== newProgress) {
          changeNewProgress(progress);
        }
      }
    }
  }, [
    loadDataChunks,
    modalActive.year,
    changeModalActive,
    newProgress,
    filteredDataChunks.length,
    loadedYears.length,
  ]);

  return (
    <Modal
      isOpen={modalActive.active}
      style={{
        content: {
          position: "fixed",
          zIndex: 10000,
          opacity: 0.99,
          height: "100%",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          paddingBottom: "10%",
          borderRadius: "none",
          width: "100vw",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <CircularProgressbarWithChildren
        value={newProgress}
        styles={buildStyles({
          strokeLinecap: "butt",
          trailColor: "#eee",
        })}
      >
        <GiHandcuffs color="#fff" size="4rem" />
        <div style={{ fontSize: 30, marginTop: 20, color: "#fff" }}>
          <strong>{newProgress}%</strong>
        </div>
      </CircularProgressbarWithChildren>
      <p>Loading {modalActive.year} Arrest Data</p>
    </Modal>
  );
};

export default SubsequentLoader;
