import axios from "axios";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000'; 
export const fetchData = async (endpoint) => {
    try {
        // throw RangeError("Its nothing")
        const response = await axios.get(`${endpoint}`, {
            headers: {
                // You can add any custom headers you need here
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
        // throw RangeError("Its nothing")
        const response = await axios.get(`${BACKEND_BASE_URL}${endpoint}`, {
            headers: {
                // You can add any custom headers you need here
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};
