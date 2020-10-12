import React, { useEffect } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { GiHandcuffs } from "react-icons/gi";
import "react-circular-progressbar/dist/styles.css";
import { useCountUp } from "react-countup";
import Modal from "react-modal";
import yearlyTotals from "./YearlyTotals";

const SubsequentLoader = (props) => {
  const { loadDataChunks, modalActive, changeModalActive } = props;

  const { countUp, update } = useCountUp({
    start: 0,
    end: 0,
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    if (loadDataChunks.current[0][modalActive.year.toString()]) {
      const newProgress =
        Number(
          loadDataChunks.current[0][modalActive.year.toString()]
            .map((x) => x.length)
            .reduce((a, b) => a + b, 0) /
            yearlyTotals[modalActive.year.toString()]
        ).toFixed(1) * 100;

      if (newProgress >= 80 && countUp !== 100) {
        update(100);
        changeModalActive({ active: false, year: null });
      } else {
        if (newProgress && newProgress !== countUp) {
          update(newProgress);
        }
      }
    }
  }, [update, countUp, loadDataChunks, modalActive.year, changeModalActive]);

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
      <p>Loading {modalActive.year} Arrest Data</p>
    </Modal>
  );
};

export default SubsequentLoader;
