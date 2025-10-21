import React, { useEffect, useState } from "react";
import "./Weatherapp.css";

const API_KEY = import.meta.env.VITE_OWM_API_KEY || "96cea15f0a6e74ec53c9166aef24dc69";
const WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";
const AIR_POLLUTION_BASE = "https://api.openweathermap.org/data/2.5/air_pollution";

export default function WeatherApp() {
  const [city, setCity] = useState("Darjeeling");
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [bgClass, setBgClass] = useState("bg-default");

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDark(!(hour >= 6 && hour < 18));
    fetchWeatherByCity(city);
  }, []);

  async function fetchWeatherByCity(cityName) {
    if (!API_KEY) {
      setError("Please add a valid OpenWeatherMap API key.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const weatherRes = await fetch(
        `${WEATHER_BASE}?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
      );
      if (!weatherRes.ok) throw new Error("City not found");

      const weatherData = await weatherRes.json();
      setWeather(weatherData);
      setCity(
        weatherData.name +
        (weatherData.sys && weatherData.sys.country ? ", " + weatherData.sys.country : "")
      );

      // 🌡️ Update background immediately based on fetched temperature
      const temp = weatherData.main?.temp;
      if (temp !== undefined) setBgClass(getBackgroundClass(temp));

      // AQI fetch
      const { coord } = weatherData;
      if (coord) {
        const aqiRes = await fetch(
          `${AIR_POLLUTION_BASE}?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}`
        );
        if (aqiRes.ok) {
          const aqiData = await aqiRes.json();
          if (aqiData?.list?.length) setAqi(aqiData.list[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch weather");
      setWeather(null);
      setAqi(null);
    } finally {
      setLoading(false);
    }
  }

  function getBackgroundClass(temp) {
    if (temp <= 5) return "bg-cold";
    if (temp > 5 && temp <= 15) return "bg-cool";
    if (temp > 15 && temp <= 25) return "bg-mild";
    if (temp > 25 && temp <= 35) return "bg-warm";
    if (temp > 35) return "bg-hot";
    return "bg-default";
  }

  function aqiHealthAdvice(aqiValue) {
    const v = Number(aqiValue);
    switch (v) {
      case 1:
        return "Good — air quality is satisfactory.";
      case 2:
        return "Fair — acceptable air quality.";
      case 3:
        return "Moderate — may affect sensitive groups.";
      case 4:
        return "Poor — avoid prolonged outdoor activity.";
      case 5:
        return "Very Poor — avoid outdoor exposure.";
      default:
        return "AQI data unavailable.";
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchWeatherByCity(query.trim());
    setQuery("");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const weatherRes = await fetch(
            `${WEATHER_BASE}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          const weatherData = await weatherRes.json();
          setWeather(weatherData);
          setCity(
            weatherData.name +
            (weatherData.sys && weatherData.sys.country
              ? ", " + weatherData.sys.country
              : "")
          );
          const temp = weatherData.main?.temp;
          if (temp !== undefined) setBgClass(getBackgroundClass(temp));

          const aqiRes = await fetch(
            `${AIR_POLLUTION_BASE}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
          );
          const aqiData = await aqiRes.json();
          if (aqiData?.list?.length) setAqi(aqiData.list[0]);
        } catch {
          setError("Failed to get location weather");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  }

  return (
  //  <div className={`${isDark ? "dark" : "light"}`}>
  //     <div className="min-h-screen flex items-center justify-center p-4">
  //        <div className="weather-container relative overflow-hidden">
      
  //     {/* Dynamic Animated Background inside container */}
  //     <div className={`absolute inset-0 ${bgClass} opacity-60 pointer-events-none z-0`}></div>

  //     {/* Overlay to improve text readability */}
  //     <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

  //     {/* Main content */}
  //     <div className="relative z-10">
  //       <header className="flex items-center justify-between mb-6">
  //         <h1 className="text-2xl font-semibold">Weather • AQI</h1>
  //         <div className="flex gap-2">
  //           <button onClick={() => setIsDark((s) => !s)}>
  //             {isDark ? "Light" : "Dark"}
  //           </button>
  //           <button onClick={useMyLocation}>📍 My Location</button>
  //         </div>
  //       </header>

  //       <form onSubmit={handleSearch} className="flex gap-2 mb-6">
  //         <input
  //           value={query}
  //           onChange={(e) => setQuery(e.target.value)}
  //           placeholder="Search city..."
  //         />
  //         <button type="submit">Search</button>
  //       </form>

  <div className={`${isDark ? "dark" : "light"}`}>
  {/* Fullscreen Background and Centering */}
  <div className="flex items-center justify-center min-h-screen w-screen relative overflow-hidden">

    {/* Dynamic Animated Background */}
    <div className={`absolute inset-0 ${bgClass} opacity-70 pointer-events-none z-0`}></div>

    {/* Weather Container */}
    <div className="relative z-10 w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white/10 backdrop-blur-md text-center">
      
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Weather • AQI</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsDark((s) => !s)}>
            {isDark ? "Light" : "Dark"}
          </button>
          <button onClick={useMyLocation}>📍 My Location</button>
        </div>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 justify-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="p-2 rounded-md border text-black w-2/3"
        />
        <button type="submit" className="p-2 rounded-md bg-blue-500 text-white">
          Search
        </button>
      </form>


        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {weather && (
          <div className="grid">
            <div className="weather-card">
              <div className="weather-main">
                <div>
                  <h2>{city}</h2>
                  <p>{weather.weather[0].description}</p>
                </div>
                <div className="weather-temp">
                  <div className="temp">{Math.round(weather.main.temp)}°C</div>
                  <div className="text-sm">
                    Feels like {Math.round(weather.main.feels_like)}°C
                  </div>
                </div>
              </div>

              <div className="weather-details">
                <div>Humidity<br /><strong>{weather.main.humidity}%</strong></div>
                <div>Wind<br /><strong>{weather.wind.speed} m/s</strong></div>
                <div>Pressure<br /><strong>{weather.main.pressure} hPa</strong></div>
              </div>
            </div>

            <aside>
              <h3>Air Quality Index</h3>
              {aqi ? (
                <>
                  <div className="text-2xl font-bold">{aqi.main.aqi}</div>
                  <p className="text-sm opacity-80 mt-1">
                    {aqiHealthAdvice(aqi.main.aqi)}
                  </p>
                </>
              ) : (
                <p>AQI data not available.</p>
              )}
            </aside>
          </div>
        )}

        <footer className="mt-4 text-xs opacity-70">
          Data provided by OpenWeatherMap.
        </footer>
      </div>
    </div>
  </div>
// </div>


  );
}
