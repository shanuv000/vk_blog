// import { useState } from "react";
import axios from "axios";
import { add_data } from "./configFirebase";

const fetchAPIURL = "https://api.ipify.org/";
const google_maps_api = process.env.NEXT_PUBLIC_GOOGLE_MAP_API;

const fetchLatandLng = `https://www.googleapis.com/geolocation/v1/geolocate?key=${google_maps_api}`;

export const getIPAddress = async () => {
  try {
    const response = await axios.get(fetchAPIURL);
    return { ip: response.data };
  } catch (error) {
    console.error("Error fetching IP address:", error.message);
    throw error;
  }
};

export const addDataToFirebase = async (sendData) => {
  if (sendData.ip !== "") {
    try {
      await add_data({ sendData });
    } catch (error) {
      console.error("Error adding data:", error.message);
      throw error;
    }
  } else {
    console.error("IP address not fetched.");
    throw new Error("IP address not fetched.");
  }
};

export const addLatandLng = async () => {
  try {
    const response = await axios.post(fetchLatandLng);
    return response.data;
  } catch (error) {
    console.error("Error fetching latitude and longitude:", error.message);
    throw error;
  }
};

export const fetchData = async () => {
  try {
    const ipData = await getIPAddress();
    const getLatandlang = await addLatandLng();
    await addDataToFirebase({
      ip: ipData.ip,
      accuracy: getLatandlang.accuracy,
      lat: getLatandlang.location.lat,
      lng: getLatandlang.location.lng,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    // Handle the error accordingly or rethrow it
    throw error;
  }
};
