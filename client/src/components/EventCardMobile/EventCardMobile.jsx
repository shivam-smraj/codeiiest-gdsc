import React from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import Button from "../Button/Button";
import "./EventCardMobile.css";

const calendar = "/assets/icons/Calendar.png";
const clock = "/assets/icons/Time.png";

const EventCardMobile = ({data}) => {
    const handleSubmit = () => {
        console.log("Button clicked");
    };

    const intersect = `/assets/thumbnail/${data.imageVariant}.png`;
    const status = (data.completionStatus || 50)*0.05;

    const Redirect = ()=> {
        window.open(data.moreInfo || data.resources, "_blank")
    }


    return (
        <div className="event-card-container">
            <div className="content-container-ecm">
                {/* Intersect Image */}
                <img className="intersect-image" src={intersect} alt="Intersect" />

                <div className="text-section">
                    <div className="progress-container">
                        <ProgressBar total={5} progress={status} size="small" className="progress-bar" />
                        <div className="percentage-text">{data.completionStatus || 50}%</div>
                    </div>

                    <div onClick={()=>Redirect()} className="title-text">{data.title}</div>
                    {/* <div className="divider"></div> */}

                    {/* Clock Icon */}
                    <div className="icon-text-container clock">
                        <img className="icon clock-icon" src={clock} alt="clock-icon" />
                        <div className="info-text">{data.sideDetails1.text3}</div>
                    </div>

                    {/* Calendar Icon */}
                    <div className="icon-text-container calendar">
                        <img className="icon calendar-icon" src={calendar} alt="calendar-icon" />
                        <div className="info-text">{data.sideDetails1.text2}</div>
                    </div>

                    {/* Know More Button */}
                    <Button
                        variant="outlined"
                        size="small"
                        text="Know More"
                        onClick={handleSubmit}
                        className="know-more-button"
                    />
                </div>
            </div>
        </div>
    );
};

export default EventCardMobile;
