import axios from "axios";

const axiosClient = axios.create({});

axiosClient.interceptors.request.use((config) => {
    const tokenStorage = localStorage.getItem("okta-token-storage");

    if (tokenStorage) {
        const tokens = JSON.parse(tokenStorage);
        const accessToken = tokens?.accessToken?.accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }

    return config;
});

export default axiosClient;