// httpClient.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const metaAxiosInstance: AxiosInstance = axios.create({
  timeout: 10000,
});

export const httpGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await metaAxiosInstance.get<T>(url, config);
    return response.data;
  } catch (error) {
    console.error("HTTP GET Error:", error);
    throw error;
  }
};

export const httpPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await metaAxiosInstance.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error("HTTP POST Error:", error);
    throw error;
  }
};

