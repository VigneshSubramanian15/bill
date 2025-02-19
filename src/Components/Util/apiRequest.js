// utils/curl.js
import { decryptData } from './crypto';

export async function ApiRequest(url, method = "GET", data = null) {
    try {
        const options = {
            method,
            headers: { "Content-Type": "application/json" },
        };

        const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("authToken");
            if (storedToken) {
                const token = decryptData(storedToken, encryptionKey);
                options.headers["Authorization"] = `${token}`;
            }
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Curl request error:", error);
        throw error;
    }
}
