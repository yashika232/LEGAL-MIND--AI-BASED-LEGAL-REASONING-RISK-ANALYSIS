import React, { useEffect, useState } from "react";

// Safe localStorage helpers — gracefully handle private browsing / storage errors
function storageGet(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn(`[Settings] Could not persist "${key}" to localStorage.`);
  }
}

export default function Settings() {
  const [theme, setTheme] = useState(() => storageGet("theme", "light"));
  const [language, setLanguage] = useState(() => storageGet("language", "en"));

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    storageSet("theme", theme);
  }, [theme]);

  useEffect(() => {
    storageSet("language", language);
  }, [language]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>Theme</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>Language</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
    </div>
  );
}
