import axios from "axios";

export const api = axios.create({
  baseURL: "https://api-william.duckdns.org/",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" 
  }
});