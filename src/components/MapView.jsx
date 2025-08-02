import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix default marker icon issue in Leaflet + Webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const MapView = ({ lat, lon, city }) => {
  const [images, setImages] = useState([]);
  const [position, setPosition] = useState({ lat, lon });
  const [locationName, setLocationName] = useState(city);

  useEffect(() => {
    if (city) {
      const fetchImages = async () => {
        try {
          const response = await axios.get(
            `https://api.unsplash.com/search/photos`,
            {
              params: { query: city, per_page: 5 },
              headers: { Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}` },
            }
          );
          setImages(response.data.results.map((img) => img.urls.small));
        } catch (error) {
          console.error("Error fetching images from Unsplash:", error);
        }
      };
      fetchImages();
    }
  }, [city]);

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lon: lng });

        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
              params: {
                lat,
                lon: lng,
                appid: import.meta.env.VITE_APP_ID,
                units: "metric",
              },
            }
          );
          const newCity = response.data.name;
          setLocationName(newCity);
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      },
    });
    return null;
  };

  if (typeof lat !== "number" || typeof lon !== "number") return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "20px auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "180px",
          marginBottom: "20px",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MapContainer
          key={lat + "," + lon}
          center={[position.lat, position.lon]}
          zoom={11}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lon]}>
            <Popup>{locationName || "Selected Location"}</Popup>
          </Marker>
          <MapClickHandler />
        </MapContainer>
      </div>
      {images.length > 0 && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "10px",
            maxWidth: "800px",
            flexWrap: window.innerWidth <= 480 ? "wrap" : "nowrap", // Stack images vertically on mobile
            justifyContent: window.innerWidth <= 480 ? "center" : "flex-start", // Center images on mobile
          }}
        >
          {images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${city} view ${index + 1}`}
              style={{
                width: window.innerWidth <= 480 ? "100%" : "150px", // Full width on mobile
                height: window.innerWidth <= 480 ? "auto" : "100px", // Auto height on mobile
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MapView;
