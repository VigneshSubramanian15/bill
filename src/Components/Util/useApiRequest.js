import { useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { decryptData } from "./crypto";

export function useApiRequest() {
  const login = useSelector((state) => state?.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiRequest = async (url, method = "GET", data = null) => {
    console.log("apiRequest called with:", { url, method, data });
    setLoading(true);
    setError(null);
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (typeof window !== "undefined") {
        if (login) {
          options.headers["Authorization"] = `${login.token}`;
        }
      }

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      setError(error.message);
      console.log("error:", error.message);
      if (error.message === "Authentication Error") {
        window.location.href = "/login";
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { apiRequest, loading, error };
}
