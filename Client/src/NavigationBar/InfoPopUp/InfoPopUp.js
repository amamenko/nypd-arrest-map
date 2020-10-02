import React from "react";
import { BsInfoCircle } from "react-icons/bs";
import { SiGithub, SiLinkedin } from "react-icons/si";
import Popup from "reactjs-popup";
import "./info_pop_up.css";
import "reactjs-popup/dist/index.css";

const InfoPopUp = () => {
  return (
    <Popup
      trigger={
        <div className="info_circle_container">
          <BsInfoCircle color="rgb(255, 255, 255)" className="info_button" />
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
            and{" "}
            <a
              href="https://data.cityofnewyork.us/Public-Safety/NYPD-Arrests-Data-Historic-/8h9b-rp9u"
              target="_blank"
              rel="noopener noreferrer"
            >
              NYPD Arrests Data (Historic)
            </a>{" "}
            NYC Open Data datasets. These datasets are updated quarterly and
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
              Have any questions? Comments? Contact me via GitHub or LinkedIn
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
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default InfoPopUp;
