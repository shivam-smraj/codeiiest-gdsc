import "./EventCard.css";
import ProgressBar from "../ProgressBar/ProgressBar";
import { AnimatePresence, motion } from "framer-motion";
import GroupAvatars from "./GroupAvatars/GroupAvatars";

const EventCard = ({
    title,
    miniTitle,
    description,
    imageVariant,
    AvatarSampleData,
    TagsList,
    sideDetails1,
    sideDetails2,
    completionStatus,
    moreInfo,
    resources
}) => {
    //taking sample values for datas which we willl get via props

    let percentageValue;

    // console.log(title);
    const AvatarLen = AvatarSampleData.length;
    if (AvatarLen <= 3) percentageValue = 100;
    else percentageValue = Math.floor(parseFloat(3 / AvatarLen) * 100);

    const completed = Math.round(5 * completionStatus/100);

    return (
        <div key={`${title}+${miniTitle}+${Math.random() * 1e9}`} className="EventCardMain">
            <span id="eventMainImg">
                <img src={`/assets/thumbnail/${imageVariant}.png`} />
                <span></span>
            </span>

            <div className="tabLabels-wrapper">
                <div style={{ background: "var(--gradient2)" }} className="section1">
                    <div className="title">
                        <h1>{title}</h1>
                        <h4>{miniTitle}</h4>
                    </div>
                </div>
            </div>

            <div className="section2">
                <div className="upper">
                    <div className="left">
                        <div className="TagWrapper">
                            {TagsList.map((tag, tagIndex) => (
                                <Tags key={tagIndex} content={tag} />
                            ))}
                        </div>
                        <div className="description">
                            <p>{description}</p>
                        </div>
                    </div>
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="right"
                    >
                        <Detail {...sideDetails1} />
                        <Detail {...sideDetails2} />
                    </motion.div>
                </div>
                <div className="lower">
                    <div className="lower-left">
                        <motion.button
                            initial={{ y: 10 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="know-more"
                            onClick={()=>window.open(moreInfo || resources || "#", "_blank")}
                        >
                            { moreInfo ? "Know more" : "Resources"}
                        </motion.button>
                    </div>
                    <div className="lower-right">
                        <GroupAvatars peopleDataArray={AvatarSampleData} />
                        <div className="progressDiv">
                            <ProgressBar total={5} progress={completed} size="small" />
                            <motion.p
                                initial={{ opacity: 0.6, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {completionStatus}%
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
const Detail = ({ text1, text2, text3 }) => {
    return (
        <div className="detail">
            <h5 className="label">{text1}</h5>
            <h4>{text2}</h4>
            {text3 && <h5 className="time">{text3}</h5>}
        </div>
    );
};

const Tags = ({ content }) => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="tag"
            >
                {content}
            </motion.div>
        </>
    );
};

export default EventCard;
