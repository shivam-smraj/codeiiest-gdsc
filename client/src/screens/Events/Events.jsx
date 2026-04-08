import React, { useEffect, useRef, useState } from "react";
import { fetchAdminData } from "../../api/apiservice";

import PageHeading from "../../components/PageHeading/PageHeading";
import EventCard from "../../components/EventCard/EventCard";
import EventTabLabels from "../../components/EventTabLabels/EventTabLabels";
import EventCardMobile from "../../components/EventCardMobile/EventCardMobile";
import Carousel from "../../components/Carousel/Carousel";

import "./Events.css";


const Events = () => {
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [clickedImage, setClickedImage] = useState(1);
    const [height, setHeight] = useState(0);

    const [tabNum, setTabNum] = useState(0);
    const [tabDelta, setTabDelta] = useState(0);

    const containerRef = useRef(null);

    useEffect(() => {
        const getEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch from Admin Panel public API
                const data = await fetchAdminData('/api/public/events');
                setEventsData(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        getEvents();
    }, []);

    const mobileItems = React.useMemo(() => {
        const items = [];
        for (let i = 0; i < eventsData.length; i += 2) {
            items.push(
                <div className="two-in-one" key={`mobile-event-group-${i}`}>
                    <EventCardMobile data={eventsData[i]} />,
                    {i + 1 < eventsData.length && <EventCardMobile data={eventsData[i+1]} />},
                </div>
            );
        }
        return items;
    }, [eventsData]); // Re-create mobileItems only if eventsData changes


    useEffect(() => {
        if (containerRef.current) {
            const available = containerRef.current.offsetHeight;
            setHeight(available);
            setTabNum(Math.floor(available / 96));
        }
    }, [containerRef.current, eventsData]); 

    const totalIndicators = tabNum !== 0 ? Math.ceil(eventsData.length / tabNum) : 0;
    const scaling = ((height - 20) / 357); // Keep original scaling logic
    if (loading) {
        return (
            <div className="Event-wrapper page">
                <div className="bg"><img src="/assets/bg/home_bg.png" alt="" /></div>
                <PageHeading text={"EVENTS"} />
                <div className="eventsBox inner-content" style={{textAlign: 'center', marginTop: '50px'}}>
                    Loading events...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Event-wrapper page">
                <div className="bg"><img src="/assets/bg/home_bg.png" alt="" /></div>
                <PageHeading text={"EVENTS"} />
                <div className="eventsBox inner-content" style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>
                    Error: {error}
                </div>
            </div>
        );
    }
    if (eventsData.length === 0) {
        return (
            <div className="Event-wrapper page">
                <div className="bg"><img src="/assets/bg/home_bg.png" alt="" /></div>
                <PageHeading text={"EVENTS"} />
                <div className="eventsBox inner-content" style={{textAlign: 'center', marginTop: '50px'}}>
                    No events found.
                </div>
            </div>
        );
    }


    return (
        <div className="Event-wrapper page">
            <div className="bg">
                <img src="/assets/bg/home_bg.png" alt="" />
            </div>
            <PageHeading text={"EVENTS"} />

            <div className="eventsBox inner-content">
                <div className="events-mobile">
                    <Carousel items={mobileItems} />
                </div>
                <div className="eventCard" style={{ transform: `scale(${scaling})`, paddingTop: "2rem", transformOrigin: "left" }}>
                    <EventCard {...eventsData[tabDelta + clickedImage - 1]} />
                </div>
                <div ref={containerRef} className="eventLabels">
                    <div
                        className="eventLabelsBoxes"
                        style={
                            {
                                // height: `${tabNum*16}px`
                            }
                        }
                    >
                        {eventsData.slice(0 + tabDelta, tabNum + tabDelta).map((e, i) => (
                            <EventTabLabels
                                key={e._id} // Use unique _id from MongoDB for key
                                title={e.title}
                                miniTitle={e.miniTitle}
                                imageVariant={e.imageVariant}
                                isClicked={clickedImage === i + 1}
                                onClick={() => setClickedImage(i + 1)}
                            />
                        ))}
                    </div>
                    <div className="eventLabelsSlider">
                        {totalIndicators !== 0 &&
                            [...Array(totalIndicators)].map((_, index) => (
                                <div
                                    className={
                                        "indicator-bar" + (Math.floor(tabDelta / tabNum) === index ? " selected" : "")
                                    }
                                    onClick={() => {
                                        setTabDelta(index * tabNum)
                                        setClickedImage(1)
                                    }}
                                    key={index}
                                    style={{
                                        opacity: 0,
                                        animation: "enter-left 1s ease 0s 1 normal forwards",
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                ></div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Events;