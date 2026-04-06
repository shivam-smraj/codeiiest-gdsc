import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./screens/Home/Home";
import Chapterpage from "./screens/Chapterpage/Chapterpage";
import Chapters from "./screens/Chapters/Chapters";
import About from "./screens/About/About";
import Events from "./screens/Events/Events";
import ComingSoon from "./screens/comingsoon/ComingSoon";
import CP_LeaderboardPage from "./screens/CP_Leaderboard/CP_LeaderboardPage";
import Team from "./screens/Team/Team"
import Codercard from "./components/Codercard/Codercard";
import Projects from "./screens/Projects/Projects";

const AllRoutes = () => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <Routes>
            <Route exact path="/" element={<Home></Home>}></Route>
            <Route exact path="/cp_leaderboard_page" element={<ComingSoon />}></Route>
            <Route exact path="/chapters">
                <Route path="" element={<Chapters />}></Route>
                <Route path=":id" element={<Chapterpage />}></Route>
                <Route path=":id/team" element={<Team />}></Route>
            </Route>
            <Route exact path="/events" element={<Events />}></Route>
            <Route exact path="/about" element={<About />}></Route>
            <Route exact path="/leaderboard" element={<CP_LeaderboardPage /> }></Route>
            {/* <Route exact path="/projects">
                <Route path="" element={<Projects />}></Route>
            </Route> */}
            <Route exact path="/test" element={<Codercard coderData={"hello"} /> }></Route>
        </Routes>
    );
};

export default AllRoutes;
