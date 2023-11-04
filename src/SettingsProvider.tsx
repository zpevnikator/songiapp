import { createContext, useContext, useEffect, useState } from "react";
import { AppSettings } from "./types";

const appSettingsKey = "appSettings";

function safeJsonParse(value: string | null) {
  if (value) {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  }
  return null;
}

const SettingsContext = createContext<
  [AppSettings, (fn: (old: AppSettings) => AppSettings) => void]
>(safeJsonParse(localStorage.getItem(appSettingsKey)));

export default function SettingsProvider({ children }) {
  const [value, setValue] = useState(
    safeJsonParse(localStorage.getItem(appSettingsKey)) || {
      showAllArtists: false,
      useDarkTheme: false,
    }
  );
  return (
    <SettingsContext.Provider value={[value, setValue]}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): AppSettings {
  const [value, setValue] = useContext(SettingsContext);

  useEffect(() => {
    localStorage.setItem(appSettingsKey, JSON.stringify(value));
  }, [value]);

  return value;
}

export function useSetSettings(): (
  fn: (old: AppSettings) => AppSettings
) => void {
  const [value, setValue] = useContext(SettingsContext);
  return setValue;
}
