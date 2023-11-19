import PageLayout from "./PageLayout";
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSetSettings, useSettings } from "./SettingsProvider";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocaleState } from "./TranslationProvider";

export default function SettingsPage() {
  const settings = useSettings();
  const setSettings = useSetSettings();
  const intl = useIntl();
  const [locale, setLocale] = useLocaleState();

  return (
    <PageLayout
      title={intl.formatMessage({ id: "settings", defaultMessage: "Settings" })}
    >
      <Box sx={{ mx: 2, mt: 2, display: "flex", alignItems: "center" }}>
        <Typography sx={{ mr: 2 }}>
          <FormattedMessage id="language" defaultMessage="Language:" />
        </Typography>
        <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="cs">Česky</MenuItem>
        </Select>
      </Box>

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
