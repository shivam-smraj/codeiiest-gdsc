import axios from "axios";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000'; 
// In dev: empty string → Vite proxy routes /api/public/* → admin panel at :3000
// In prod: set VITE_ADMIN_API_URL to your deployed admin panel URL
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || '';

export const fetchData = async (endpoint) => {
    try {
        const response = await axios.get(`${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const fetchDataNew = async (endpoint) => {
    try {
        const response = await axios.get(`${BACKEND_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

/**
 * Fetch from CodeIIEST Admin Panel public API.
 * Used for leaderboard users and events.
 */
export const fetchAdminData = async (endpoint) => {
    try {
        const response = await axios.get(`${ADMIN_API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};
