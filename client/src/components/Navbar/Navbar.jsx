// v2 — force Vite HMR reload
import { useState } from "react";
import { Drawer } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import Button from "../Button/Button";
import "./Navbar.css";
import { Menuicon } from "../../../public/assets/svgvectors";
import CFHandleModal from "../CFHandleModal/CFHandleModal";

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
	// CF Handle modal props (injected from App.jsx)
	cfAuth,
	cfModalOpen,
	onCFModalOpen,
	onCFModalClose,
}) => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { innerWidth: width } = window;

	const handleDrawerOpen  = () => setDrawerOpen(true);
	const handleDrawerClose = () => setDrawerOpen(false);
	const handleLinkClick   = () => setDrawerOpen(false);

	return (
		<>
			{/* ── Desktop Navbar ──────────────────────────────────────────── */}
			<div className="navbar">
				<div className="left-col">
					<Link to="/" className="logo">
						<img src={"/assets/logo/codeiiest-logo.png"} />
						CodeIIEST
					</Link>

					{/* Hamburger — only on mobile */}
					{width <= 720 && (
						<Button
							id="drawer-open-btn"
							onClick={handleDrawerOpen}
							variant="filled"
							color="white"
							innerText={
								<span className="material-icons" style={{ color: "var(--red)" }}>
									menu
								</span>
							}
						/>
					)}
				</div>

				{/* Desktop nav links */}
				<div className="nav-items">
					{width >= 720 && (
						<>
							<NavLink id="nav-home"        className="item" to="/">Home</NavLink>
							<NavLink id="nav-events"      className="item" to="/events">Events</NavLink>
							<NavLink id="nav-chapters"    className="item" to="/chapters">Chapters</NavLink>
							<NavLink id="nav-about"       className="item" to="/about">About Us</NavLink>
							<NavLink id="nav-leaderboard" className="item" to="/leaderboard">Leaderboards</NavLink>

							{/* CF Handle button — same style as nav items */}
							<button
								id="nav-cf-handle-btn"
								className="item cf-nav-btn"
								onClick={onCFModalOpen}
							>
								<span className="material-icons" style={{ fontSize: "1rem", marginRight: 6 }}>
									code
								</span>
								{cfAuth?.isSignedIn ? "My CF Handle" : "Add CF Handle"}
							</button>
						</>
					)}
				</div>

				{/* Right logo */}
				<div className="left-col">
					<Link to="/" className="logo">
						GDG IIESTS
						<img src={"/assets/logo/gdsc-logo.png"} />
					</Link>
					{width <= 720 && (
						<Button
							id="drawer-open-btn-2"
							onClick={handleDrawerOpen}
							variant="filled"
							color="black"
							innerText={
								<span className="material-icons" style={{ color: "var(--red)" }}>
									menu
								</span>
							}
						/>
					)}
				</div>
			</div>

			{/* ── Mobile Drawer ────────────────────────────────────────────── */}
			<Drawer
				variant="persistent"
				anchor="left"
				open={drawerOpen}
				className="drawer"
			>
				<Link to="/" className="logo">
					<div>
						<img src="/assets/logo/codeiiest-logo.png" alt="" />
					</div>
				</Link>

				<Button
					id="drawer-close-btn"
					onClick={handleDrawerClose}
					variant="text"
					color="purple"
					size="large"
					className="drawer-close-btn"
					innerText={<span className="material-icons">close</span>}
				/>

				<div className="nav-items">
					<NavLink className="item" to="/"            onClick={handleLinkClick}>Home</NavLink>
					<NavLink className="item" to="/events"      onClick={handleLinkClick}>Events</NavLink>
					<NavLink className="item" to="/chapters"    onClick={handleLinkClick}>Chapters</NavLink>
					<NavLink className="item" to="/about"       onClick={handleLinkClick}>About Us</NavLink>
					<NavLink className="item" to="/leaderboard" onClick={handleLinkClick}>Leaderboards</NavLink>

					{/* CF Handle button — right after Leaderboard */}
					<button
						id="drawer-cf-handle-btn"
						className="item cf-nav-btn"
						onClick={() => { handleDrawerClose(); onCFModalOpen(); }}
					>
						<span className="material-icons" style={{ fontSize: "1.1rem", marginRight: 8 }}>code</span>
						{cfAuth?.isSignedIn ? "My CF Handle" : "Add CF Handle"}
					</button>
				</div>
			</Drawer>

			{/* CF Handle Modal — always mounted, controlled by App */}
			{cfAuth && (
				<CFHandleModal
					open={cfModalOpen}
					onClose={onCFModalClose}
					auth={cfAuth}
				/>
			)}
		</>
	);
};

export default Navbar;
