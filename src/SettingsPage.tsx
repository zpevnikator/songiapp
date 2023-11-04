import PageLayout from "./PageLayout";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useSetSettings, useSettings } from "./SettingsProvider";

export default function SettingsPage() {
  const settings = useSettings();
  const setSettings = useSetSettings();

  return (
    <PageLayout title="Settings">
      <List>
        <ListItem>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={settings.showAllArtists}
              tabIndex={-1}
              disableRipple
              onChange={(e) => {
                setSettings((x) => ({
                  ...x,
                  showAllArtists: e.target.checked,
                }));
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Show all artists"
            secondary="Don't show alphabet on Artists page. Can be much slower."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={settings.useDarkTheme}
              tabIndex={-1}
              disableRipple
              onChange={(e) => {
                setSettings((x) => ({
                  ...x,
                  useDarkTheme: e.target.checked,
                }));
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Use dark theme"
          />
        </ListItem>
      </List>
    </PageLayout>
  );
}
