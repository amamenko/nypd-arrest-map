import React from "react";
import { BsInfoCircle } from "react-icons/bs";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { ImMail } from "react-icons/im";
import Popup from "reactjs-popup";
import "./info_pop_up.css";
import "reactjs-popup/dist/index.css";

const InfoPopUp = (props) => {
  const { footerMenuActive, isMobile } = props;

  return (
    <Popup
      trigger={
        <div
          className="info_circle_container"
          style={{
            pointerEvents: isMobile
              ? footerMenuActive
                ? "none"
                : "all"
              : "all",
          }}
        >
          <BsInfoCircle
            color="rgb(255, 255, 255)"
            style={{
              opacity: isMobile ? (footerMenuActive ? 0.2 : 1) : 1,
              transition: "opacity 1s ease",
            }}
            className="info_button"
          />
        </div>
      }
      modal
    >
      {(close) => (
        <div className="modal">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header">About NYPD Arrest Map</div>
          <div className="content">
            NYPD Arrest Map is a data visualization and analysis tool that
            utilizes the{" "}
            <a
              href="https://data.cityofnewyork.us/Public-Safety/NYPD-Arrest-Data-Year-to-Date-/uip8-fykc"
              target="_blank"
              rel="noopener noreferrer"
            >
              NYPD Arrest Data (Year to Date)
            </a>{" "}
            NYC Open Data dataset. This dataset is updated quarterly and
            reviewed by the Office of Management Analysis and Planning before
            being posted on the New York Police Department website. The data
            reflected here will be updated shortly after such changes.
            <br />
            <br />
            Occasionally, arrests in the NYPD datasets will be erroneously
            attributed to one borough, while having the longitude and latitude
            of another. These have been corrected in the NYPD Arrest Map in
            favor of the arrest's geocoordinates.
            <br />
            <br />
            As stated by the NYPD, "each record represents an arrest effected in
            NYC by the NYPD and includes information about the type of crime,
            the location and time of enforcement. In addition, information
            related to suspect demographics is also included. This data can be
            used by the public to explore the nature of police enforcement
            activity."
            <br />
            <br />
            <p>
              Have any questions? Comments? Contact me via e-mail or LinkedIn
            </p>
            <div className="pop_up_icons_container">
              <a
                href="https://github.com/amamenko/nypd-arrest-map-full-stack"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub color="#000" />
              </a>
              <a
                href="https://www.linkedin.com/in/avraham-mamenko-0599831b8/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiLinkedin color="#000" />
              </a>
              <a href="mailto:amamenko@hotmail.com?subject=Comment/Question About NYPD Arrest Map">
                <ImMail color="#000" />
              </a>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default InfoPopUp;
