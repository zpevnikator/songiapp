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
import { useIntl } from "react-intl";

export default function SettingsPage() {
  const settings = useSettings();
  const setSettings = useSetSettings();
  const intl = useIntl();

  return (
    <PageLayout
      title={intl.formatMessage({ id: "settings", defaultMessage: "Settings" })}
    >
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
            primary={intl.formatMessage({
              id: "show-all-artists",
              defaultMessage: "Show all artists",
            })}
            secondary={intl.formatMessage({
              id: "show-all-artists.detail",
              defaultMessage:
                "Don't show alphabet on Artists page. Can be much slower.",
            })}
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
            primary={intl.formatMessage({
              id: "use-dark-theme",
              defaultMessage: "Use dark theme",
            })}
          />
        </ListItem>
      </List>
    </PageLayout>
  );
}
