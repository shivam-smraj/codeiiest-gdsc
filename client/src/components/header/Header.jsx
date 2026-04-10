import {
    IconButton,
    Menu,
    MenuItem,
    AppBar,
    Box,
    Typography,
    useMediaQuery,
    useTheme,
    Button,
    ButtonGroup,
    List,
    Drawer,
    ListItem,
    ListItemText,
} from "@mui/material";
import { useState } from "react";
// import Menuicon from "@mui/icons-material/Menu";
import { Menuicon } from "../../../public/assets/svgvectors";
import { Close } from "../../../public/assets/svgvectors";
import "./Header.css";
import CodeIIEST from "/assets/logo/codeiiest-logo.png";

import { Link, NavLink } from "react-router-dom";

// const Menubutton = () => {
//     const [anchorElm, setAnchorElm] = useState(null);
//     const [open, setOpen] = useState(false);

//     const handleClose = () => {
//         setAnchorElm(null);
//         setOpen(false);
//     };
//     const handleClick = (e) => {
//         setAnchorElm(e.currentTarget);
//         setOpen(true);
//     };

//     return (
//         <Box sx={{ paddingRight: 1 }}>
//             <IconButton onClick={handleClick} className="icon-button" aria-label="delete" size="large">
//                 <Menuicon cls={"cls"} color={"#fff"} />
//             </IconButton>
//             <Menu anchorEl={anchorElm} open={open} onClose={handleClose}>
//                 <NavLink style={{ textDecoration: "none" }} to="/home">
//                     <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
//                         Home
//                     </MenuItem>
//                 </NavLink>
//                 <NavLink style={{ textDecoration: "none" }} to="/events">
//                     <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
//                         Home
//                     </MenuItem>
//                 </NavLink>
//                 <NavLink style={{ textDecoration: "none" }} to="/chapters">
//                     <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
//                         Chapters
//                     </MenuItem>
//                 </NavLink>
//                 <NavLink style={{ textDecoration: "none" }} to="/leaderboard">
//                     <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
//                         Leaderboard
//                     </MenuItem>
//                 </NavLink>
//                 <NavLink style={{ textDecoration: "none" }} to="/about">
//                     <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
//                         About us
//                     </MenuItem>
//                 </NavLink>
//             </Menu>
//         </Box>
//     );
// };

// const HeaderTabs = () => {
//     return (
//         <ButtonGroup sx={{ textDecoration: "none", marginRight: 1 }}>
//             <NavLink className="navlink" to="/home">
//                 <Button
//                     sx={{
//                         border: "0",
//                         color: "white",
//                         fontWeight: 600,
//                         textDecoration: "none",
//                     }}
//                     color="inherit"
//                 >
//                     Home
//                 </Button>
//             </NavLink>
//             <NavLink className="navlink" to="/events">
//                 <Button
//                     sx={{
//                         border: "0",
//                         color: "white",
//                         fontWeight: 600,
//                         textDecoration: "none",
//                     }}
//                     color="inherit"
//                 >
//                     Home
//                 </Button>
//             </NavLink>
//             <NavLink className="navlink" to="/chapters">
//                 <Button
//                     sx={{
//                         border: 0,
//                         color: "white",
//                         backgroundColor: "inherit",
//                         fontWeight: 600,
//                         textDecoration: "none",
//                     }}
//                     color="inherit"
//                 >
//                     Chapters
//                 </Button>
//             </NavLink>
//             <NavLink className="navlink" to="/about">
//                 <Button
//                     sx={{
//                         border: 0,
//                         color: "white",
//                         backgroundColor: "none",
//                         fontWeight: 600,
//                         textDecoration: "none",
//                     }}
//                     color="inherit"
//                 >
//                     About us
//                 </Button>
//             </NavLink>
//             <NavLink className="navlink" to="/leaderboard">
//                 <Button
//                     sx={{
//                         border: 0,
//                         color: "white",
//                         backgroundColor: "none",
//                         fontWeight: 600,
//                         textDecoration: "none",
//                     }}
//                     color="inherit"
//                 >
//                     Leaderboard
//                 </Button>
//             </NavLink>
//         </ButtonGroup>
//     );
// };

const MenuDrawer = ({ cfAuth, onCFModalOpen }) => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setOpen(open);
    };

    const menuItems = [
        { text: "Home", link: "/" },
        { text: "About", link: "/about" },
        { text: "Chapters", link: "/chapters" },
        { text: "Events", link: "/events" },
        // { text: "Projects", link: "/projects" },
        { text: "Leaderboard", link: "/leaderboard" },
    ];

    const list = () => (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                background: `url("/assets/life.webp")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom",
                backgroundSize: "contain",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(0deg, rgba(20,20,112,0) 10%, rgba(30, 30, 30,1) 35%)",
                    zIndex: 1,
                },
                // Ensure that any children elements are on top of the overlay
                "& > *": {
                    position: "relative",
                    zIndex: 2,
                },
            }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
            className="menu-drawer"
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", margin: "2rem", alignItems: "center" }}>
                <img src={CodeIIEST} className="brand" />
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(false)}>
                    <Close cls={"cls"} color={"#fff"} />
                </IconButton>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    fontSize: "1.2rem",
                    marginTop: "5rem",
                }}
            >
                {menuItems.map((item, index) => (
                    <NavLink className={"item"} key={index} to={item.link}>
                        {item.text}
                    </NavLink>
                ))}

                {/* CF Handle button — matches nav item style */}
                <button
                    id="drawer-cf-handle-btn"
                    className="item cf-nav-btn"
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 400,
                        letterSpacing: "inherit",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleDrawer(false)(e);
                        onCFModalOpen && onCFModalOpen();
                    }}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>code</span>
                    {cfAuth?.isSignedIn ? "My CF Handle" : "Add CF Handle"}
                </button>
            </Box>
        </Box>
    );

    return (
        <>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ marginRight: 2 }}
            >
                <Menuicon cls={"cls"} color={"#fff"} />
            </IconButton>
            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                {list()}
            </Drawer>
        </>
    );
};

const Header = ({ cfAuth, onCFModalOpen }) => {
    const theme = useTheme();
    // const mobileView = useMediaQuery(theme.breakpoints.down(800));
    return (
        <Box className="small-header">
            <AppBar
                sx={{
                    backgroundColor: "transparent",
                    // py: 0.5,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 2,
                        minHeight: "60px",
                    }}
                >
                    <Link
                        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
                        to="/"
                    >
                        {/* <Menuicon cls={"cls"} color={"#fff"} /> */}
                        <img src={CodeIIEST} className="cls" />
                        <Typography
                            variant="h5"
                            sx={{
                                color: "white",
                                fontWeight: 400,
                                fontFamily: "Chakra Petch",
                            }}
                        ></Typography>
                    </Link>
                </Box>
                <MenuDrawer cfAuth={cfAuth} onCFModalOpen={onCFModalOpen} />
            </AppBar>
        </Box>
    );
};

export default Header;
