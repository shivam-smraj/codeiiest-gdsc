import * as React from "react";
import "./LeaderboardMUI.css";
import { Tooltip, Box, Avatar, ThemeProvider, createTheme } from "@mui/material";
import CustomDataGrid from "../../components/customdatagrid/customdatagrid";

import { useState, useEffect, useRef } from "react";
import Loading from "../../components/loading/Loading";
import Error from "../../components/error/Error";
import useFetchCF from "../../hooks/useFetchCF";
import { delayForLeaderBoardsPage } from "../iconloader/IconLoader";
import { motion } from "framer-motion";
import { fetchAdminData } from "../../api/apiservice";

const darkTheme = createTheme({
    palette: { mode: "dark" },
});

function CFTag(rating) {
    if (rating < 1200) return "newbie";
    if (rating < 1400) return "pupil";
    if (rating < 1600) return "specialist";
    if (rating < 1900) return "expert";
    if (rating < 2100) return "candidate-master";
    if (rating < 2400) return "master";
    return "grandmaster";
}

function ratingTag(params) {
    const rating = params.value;
    return <div className={"lb " + CFTag(rating)}>{rating}</div>;
}

function Msg({ msg }) {
    return <div className="tooltip-msg" style={{ fontSize: "1rem" }}>{msg}</div>;
}

function getRank(val) {
    const rank = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    if (val - 1 < 10)
        return <span style={{ transform: "scale(1.5)", display: "flex", transformOrigin: "left" }}>{rank[val - 1]}</span>;
    return val;
}

const cfcolumns = [
    {
        field: "id", headerName: "#", width: 50,
        headerClassName: "lb-header", resizable: false, sortable: false,
        renderCell: (params) => (
            <Tooltip title={params.value} arrow placement="right">
                <>{getRank(params.value)}</>
            </Tooltip>
        ),
    },
    {
        field: "handle", headerName: "User Handle", width: 200,
        headerClassName: "lb-header", sortable: false, resizable: false,
        renderCell: (params) => (
            <Tooltip title={<Msg msg={`${params.row.rank}, ${params.row.name}`} />} arrow placement="right">
                <a className="usr_name" href={`https://codeforces.com/profile/${params.value}`}>
                    <div className="usr">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: "rgb(244, 110, 110)" }} src={`${params.row.avatar}`}>
                            {params.value[0].toUpperCase()}
                        </Avatar>
                        {params.value}
                    </div>
                </a>
            </Tooltip>
        ),
    },
    {
        field: "year", headerName: "Batch", width: 70,
        sortable: false, headerClassName: "lb-header", resizable: false, headerAlign: "center",
        renderCell: (params) => `${params.value ?? "—"}`,
    },
    {
        field: "rating", headerName: "Rating", width: 100,
        renderCell: ratingTag, headerClassName: "lb-header", resizable: false, headerAlign: "center",
    },
    {
        field: "maxrating", headerName: "Best", width: 100,
        renderCell: ratingTag, headerClassName: "lb-header", resizable: false, headerAlign: "center",
    },
];

const ADMIN_CACHE_KEY = "adminLBUsers";
const ADMIN_CACHE_TIME_KEY = "adminLBUsersTime";
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const LeaderboardMUI = ({ parentHeight, style, setData, setLoading, delayT }) => {
    const [show] = useState(1);
    // cfUsers: handle.toLowerCase() -> [name, graduationYear]
    const [cfUsers, setCfUsers] = useState({});
    const [cfHandles, setCfHandles] = useState([]);
    const [adminError, setAdminError] = useState(null);

    // Fetch user list from Admin Panel public API on mount
    useEffect(() => {
        const buildUserMap = (users) => {
            const map = {};
            const handles = [];
            for (const user of users) {
                if (!user.handle || user.handle.trim() === "") continue;
                const h = user.handle.trim().toLowerCase();
                map[h] = [user.name, user.year];
                handles.push(user.handle.trim());
            }
            setCfUsers(map);
            setCfHandles(handles); // triggers useFetchCF to re-run
        };

        const loadUsers = async () => {
            // Try cache first
            try {
                const cached = localStorage.getItem(ADMIN_CACHE_KEY);
                const cachedTime = parseInt(localStorage.getItem(ADMIN_CACHE_TIME_KEY) || "0");
                if (cached && Date.now() - cachedTime < ADMIN_CACHE_TTL) {
                    buildUserMap(JSON.parse(cached));
                    return;
                }
            } catch (_) {}

            try {
                const users = await fetchAdminData("/api/public/leaderboard");
                localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(users));
                localStorage.setItem(ADMIN_CACHE_TIME_KEY, String(Date.now()));
                buildUserMap(users);
            } catch (err) {
                console.error("[LeaderboardMUI] Failed to fetch admin user list:", err);
                const cached = localStorage.getItem(ADMIN_CACHE_KEY);
                if (cached) {
                    buildUserMap(JSON.parse(cached));
                } else {
                    setAdminError("Could not load user list from admin panel.");
                    setLoading(false);
                }
            }
        };

        loadUsers();
    }, []);

    const { data, loading, error } = useFetchCF(cfHandles);

    // Merge name+year from our admin map into CF data — use useEffect to avoid render-time side effects
    const enrichedData = React.useMemo(() => {
        if (!data) return null;
        return data.map((user) => {
            const info = cfUsers[user.handle.toLowerCase()];
            if (info) {
                return { ...user, name: info[0], year: info[1] };
            }
            return user;
        });
    }, [data, cfUsers]);

    // Propagate data up to parent (calculateTopCoders needs it)
    const prevDataRef = useRef(null);
    useEffect(() => {
        if (enrichedData && enrichedData !== prevDataRef.current) {
            prevDataRef.current = enrichedData;
            setData(enrichedData);
        }
    }, [enrichedData, setData]);

    // Show admin-level loading while waiting for handles from API
    const isHandlesLoading = cfHandles.length === 0 && !adminError;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delayForLeaderBoardsPage + delayT * 0.2, duration: 0.5 }}
            className="leaderboard-mui"
            style={style}
        >
            {adminError && (
                <div style={{ color: "orange", padding: "8px", fontSize: "0.85rem" }}>
                    ⚠️ {adminError}
                </div>
            )}
            <Box className="datagrid-wrapper">
                {isHandlesLoading || loading ? (
                    <Loading cols={cfcolumns} height={parentHeight} />
                ) : error ? (
                    <Error
                        message={"CF API Fetching Failed. Please try again later"}
                        error_code={(error && error.response?.request?.status) || 404}
                        cols={cfcolumns}
                    />
                ) : (
                    <ThemeProvider theme={darkTheme}>
                        <CustomDataGrid
                            rows={enrichedData}
                            columns={cfcolumns}
                            toshow={show}
                            provideSearch={false}
                            parentHeight={parentHeight}
                        />
                    </ThemeProvider>
                )}
            </Box>
        </motion.div>
    );
};

export default LeaderboardMUI;
