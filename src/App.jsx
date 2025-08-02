import React, { useState, useEffect } from "react";
import Weather from "./components/Weather";

const App = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className={`app ${theme}`}>
      <Weather />
    </div>
  );
};

export default App;
