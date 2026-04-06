import { useState, useEffect } from "react";
import {
	Drawer,
	Divider,
	Avatar,
	Menu,
	MenuItem,
	IconButton,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Stack
} from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import Button from "../Button/Button";
import "./Navbar.css";
import { Menuicon } from "../../../public/assets/svgvectors";


const Navbar = ({
	user,
	login,
	logout,
	emailVerificationOpen,
	authOpen,
	onAuthOpen,
	onAuthClose,
	onEmailverifyOpen,
	onEmailverifyClose,
}) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	// const [authOpen, setAuthOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	// const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
	const [menuItems, setMenuItems] = useState([]);
	const menuOpen = Boolean(anchorEl);

	const { innerWidth: width, innerHeight: height } = window;
	// console.log(width, height);

	const handleDrawerOpen = () => {
		setDrawerOpen(true);
	};
	const handleDrawerClose = () => {
		setDrawerOpen(false);
	};

	const handleMenuOpen = (event) => {
		// handleSetMenuItems(event.currentTarget.id);
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
		// return navigate("/");
	};
	// This func will be needed to generalize menus in navbar ->
	const handleSetMenuItems = (id) => {
		const items = [];
		switch (id) {
			case "nav-avatar": {
				items.push(...[
					
					{
						name: "Help",
						func: null,
					},
					{
						name: "Log out",
						func: handleLogout,
					},
				]);
				break;
			}
		}
		console.log(items);
		setMenuItems(items);
	};

	const handleLogout = () => {
		setAnchorEl(null);
		const logginOut = async () => {
			try {
				await logoutAuth();
				logout();
				window.location.reload();
			} catch (err) {
				alert({ message: err.response.data.message || err.message, type: "error" });
			}
		};
		logginOut();
	};

	const handleLinkClick = () => {
		// setMenuOpen(false);
		handleDrawerClose();
	};

	const handleAuthOpen = () => {
		onAuthOpen();
	};
	const handleAuthClose = () => {
		onAuthClose;
	};

	const handleEmailverifyOpen = () => {
		onEmailverifyOpen;
	};
	const handleEmailverifyClose = () => {
		onEmailverifyClose;
	};

	return (
		<>
			<div className="navbar">
				<div className="left-col">
					<Link to="/" className="logo">
						<img src={"/assets/logo/codeiiest-logo.png"} />
						CodeIIEST
					</Link>

					{width <= 720 && (
						<>
							<Button
								id="drawer-open-btn"
								onClick={handleDrawerOpen}
								variant="filled"
								color="white"
								innerText={
									<span
										className="material-icons"
										style={{ color: "var(--red)" }}
									>
										menu
									</span>
								}
							></Button>
						</>
					)}
				</div>

				<div className="nav-items">
					{width >= 720 && (
						<>
							<NavLink id="nav-home" className={"item"} to="/">
								Home
							</NavLink>
							<NavLink
								id="nav-events"
								className={"item"}
								to="/events"
							>
								Events
							</NavLink>
							<NavLink
								id="nav-chapters"
								className={"item"}
								to="/chapters"
							>
								Chapters
							</NavLink>
							<NavLink
								to="/about"
								id="nav-sponsorship"
								className={"item"}
							>
								About Us
							</NavLink>
							{/* <NavLink
								to="/projects"
								id="nav-projects"
								className={"item"}
							>
								Projects
							</NavLink> */}
							<NavLink
								id="nav-leaderboard"
								to="/leaderboard"
								className={"item"}
							>
								Leaderboards
							</NavLink>

							{/* {user ? (
								<div
									className="item"
									id="nav-avatar"
									onClick={(e) => handleMenuOpen(e)}
									// onMouseOut={handleMenuClose}
								>
									<Avatar
										alt={user.name}
										src={user.image}
									></Avatar>
									<span className="material-icons">
										arrow_drop_down
									</span>
								</div>
							) : (
								<div className="item">
									<Button
										// size="large"
										variant="filled"
										color="red"
										innerText={"Log in"}
										onClick={handleAuthOpen}
									></Button>
									<ComingSoonDialog open={dialogOpen}></ComingSoonDialog>
								</div>
							)} */}
						</>
					)}
				</div>
				<div className="left-col">
					<Link to="/" className="logo">
						GDG IIESTS
						<img src={"/assets/logo/gdsc-logo.png"} />
					</Link>
					{width <= 720 && (
						<>
							<Button
								id="drawer-open-btn"
								onClick={handleDrawerOpen}
								variant="filled"
								color="black"
								innerText={
									<span
										className="material-icons"
										style={{ color: "var(--red)" }}
									>
										menu
									</span>
								}
							></Button>
						</>
					)}
				</div>
			</div>
			<Drawer
				variant="persistent"
				anchor="left"
				open={drawerOpen}
				className="drawer"
			>
				<div className="bg">
					<img src={<Menuicon cls={'cls'} />} alt="" />
				</div>
				<Link to="/" className="logo">
					<div>
						<img src="/assets/logo/codeiiest-logo.png" alt="" />
						{/* REBECA */}
					</div>
				</Link>
				<Button
					id="drawer-close-btn"
					onClick={handleDrawerClose}
					variant="text"
					color="purple"
					size="large"
					className={"drawer-close-btn"}
					innerText={<span className="material-icons">close</span>}
				></Button>
				{/* <div className="title">Good Times Vacation</div> */}
				{/* <Divider /> */}
				<div className="nav-items">
					<NavLink
						className={"item"}
						to="/"
						onClick={handleLinkClick}
					>
						Home
					</NavLink>
					<NavLink
						className={"item"}
						to="/events"
						onClick={handleLinkClick}
					>
						Events & Schedule
					</NavLink>
					<NavLink
						className={"item"}
						to="/sponsorship"
						onClick={handleLinkClick}
					>
						Sponsorship
					</NavLink>
					<NavLink
						to="/about"
						onClick={handleLinkClick}
						className={"item"}
					>
						Our Team
					</NavLink>
					<NavLink
						to="/merchandise"
						onClick={handleLinkClick}
						className={"item"}
					>
						Merchandise
					</NavLink>
					{/* <NavLink
						onClick={handleLinkClick}
						to="/faq"
						className={"item"}
					>
						FAQs
					</NavLink> */}
				</div>
			</Drawer>
			{/* {user && (
				// <UserMenu
				// 	user={user}
				// 	logout={handleLogout}
				// 	anchorEl={anchorEl}
				// 	handleMenuClose={handleMenuClose}
				// ></UserMenu>
			)} */}
		</>
	);
};

export default Navbar;
