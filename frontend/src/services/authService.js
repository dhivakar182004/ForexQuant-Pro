import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/auth/';

const register = (name, email, password) => {
    return axios.post(API_URL + 'register', {
        name,
        email,
        password,
    });
};

const login = (email, password) => {
    return axios
        .post(API_URL + 'login', {
            email,
            password,
        })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

const sendOtp = (email) => {
    return axios.post(API_URL + 'otp/send', { email });
};

const verifyOtp = (email, code) => {
    return axios.post(API_URL + 'otp/verify', { email, code })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        return JSON.parse(userStr);
    } catch (e) {
        console.error("AuthService: Error parsing user from localStorage", e);
        return null;
    }
};

const authService = {
    register,
    login,
    sendOtp,
    verifyOtp,
    logout,
    getCurrentUser,
};

export default authService;
