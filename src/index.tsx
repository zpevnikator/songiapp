import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { createHashRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import DatabaseListPage from "./DatabaseListPage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ArtistListPage from "./ArtistListPage";
import ByArtistListPage from "./ByArtistListPage";
import SongPage from "./SongPage";
import SearchPage from "./SearchPage";
import SettingsPage from "./SettingsPage";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import SettingsProvider, { useSettings } from "./SettingsProvider";

const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: "/",
    element: <ArtistListPage />,
  },
  {
    path: "/databases",
    element: <DatabaseListPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "/by-artist/:artistid",
    element: <ByArtistListPage />,
  },
  {
    path: "/songs/:songid",
    element: <SongPage />,
  },
  {
    path: "/databases/:dbid",
    element: <ArtistListPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lighTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function CurrentThemeProvider({ children }) {
  const settings = useSettings();
  return (
    <ThemeProvider theme={settings.useDarkTheme ? darkTheme : lighTheme}>
      {children}
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <CurrentThemeProvider>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </CurrentThemeProvider>
    </SettingsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
