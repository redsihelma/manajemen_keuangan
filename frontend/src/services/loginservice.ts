import axios, { AxiosError } from "axios";

const BASE_URL = "http://localhost:5000/api";

const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const respons = await axios.post(`${BASE_URL}/login`, {
      username,
      password,
    });
    return true; // Login berhasil
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `Login failed with status code ${axiosError.response.status}`
        );
      } else if (axiosError.request) {
        throw new Error("No response received from server");
      } else {
        throw new Error("Network error occurred, please try again");
      }
    } else {
      throw new Error("Failed to login");
    }
  }
};

export default {
  login,
};
