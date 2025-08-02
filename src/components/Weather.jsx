import React, { useState, useRef } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";
import pressure_icon from "../assets/pressure.png";
import visibility_icon from "../assets/visibility.png";
import sunrise_icon from "../assets/sunrise.png";
import sunset_icon from "../assets/sunset.png";
import MapView from "./MapView";

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const allicons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": cloud_icon,
    "04n": cloud_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "11d": rain_icon,
    "11n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
    "50d": drizzle_icon,
    "50n": drizzle_icon,
  };

  const getWeatherBg = (icon) => {
    // OpenWeatherMap icon kód alapján
    if (icon.startsWith("01"))
      return "linear-gradient(120deg, #fceabb 0%, #f8b500 100%)"; // napos
    if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04"))
      return "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)"; // felhős
    if (icon.startsWith("09") || icon.startsWith("10"))
      return "linear-gradient(120deg, #667db6 0%, #0082c8 50%, #0082c8 100%)"; // esős
    if (icon.startsWith("11"))
      return "linear-gradient(120deg, #232526 0%, #414345 100%)"; // vihar
    if (icon.startsWith("13"))
      return "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)"; // havas
    if (icon.startsWith("50"))
      return "linear-gradient(120deg, #bdc3c7 0%, #2c3e50 100%)"; // köd
    return "linear-gradient(45deg, #2f4680, #500ae4)"; // alapértelmezett
  };

  const search = async (city) => {
    if (!city.trim()) {
      setErrorMessage("Please enter a city name!");
      setWeatherData(null);
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "City not found!");
        setWeatherData(null);
        return;
      }

      const timezoneOffset = data.timezone; // in seconds
      // Use UTC time as base, then add city offset
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const localTime = new Date(utc + timezoneOffset * 1000);
      const formattedTime = localTime.toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      setWeatherData({
        temperature: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: (data.visibility / 1000).toFixed(1),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        location: data.name,
        icon: allicons[data.weather[0].icon] || clear_icon,
        time: formattedTime,
        lat: data.coord.lat,
        lon: data.coord.lon,
        bg: getWeatherBg(data.weather[0].icon),
      });

      setErrorMessage("");
    } catch {
      setErrorMessage("An error occurred while fetching weather data!");
      setWeatherData(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search(inputRef.current.value);
    }
  };

  return (
    <div
      className="weather"
      style={
        weatherData && weatherData.bg ? { backgroundImage: weatherData.bg } : {}
      }
    >
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter city name..."
          onKeyDown={handleKeyDown}
        />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {weatherData ? (
        <>
          <img
            src={weatherData.icon}
            alt="Weather icon"
            className="weather-icon"
          />
          <p className="temperature">{weatherData.temperature} °C</p>
          <p className="feels-like">Feels like: {weatherData.feelsLike} °C</p>
          <p className="location">{weatherData.location}</p>
          <p className="time">{weatherData.time}</p>
          {/* MapView for city location */}
          <MapView
            lat={weatherData.lat}
            lon={weatherData.lon}
            city={weatherData.location}
          />
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity icon" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind speed icon" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
            <div className="col">
              <img src={pressure_icon} alt="Pressure icon" />
              <div>
                <p>{weatherData.pressure} hPa</p>
                <span>Pressure</span>
              </div>
            </div>
            <div className="col">
              <img src={visibility_icon} alt="Visibility icon" />
              <div>
                <p>{weatherData.visibility} km</p>
                <span>Visibility</span>
              </div>
            </div>
            <div className="col">
              <img src={sunrise_icon} alt="Sunrise icon" />
              <div>
                <p>{weatherData.sunrise}</p>
                <span>Sunrise</span>
              </div>
            </div>
            <div className="col">
              <img src={sunset_icon} alt="Sunset icon" />
              <div>
                <p>{weatherData.sunset}</p>
                <span>Sunset</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="no-data">No weather data available.</p>
      )}
    </div>
  );
};

export default Weather;
