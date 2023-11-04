import PageLayout from "./PageLayout";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";

export const showAllArtistsKey = "showAllArtists";

export default function SettingsPage() {
  const [showAllArtists, setShowAllArtists] = useState(
    localStorage.getItem(showAllArtistsKey) == "1"
  );

  return (
    <PageLayout title="Settings">
      <List>
        <ListItem>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={showAllArtists}
              tabIndex={-1}
              disableRipple
              onChange={(e) => {
                setShowAllArtists(e.target.checked);
                localStorage.setItem(
                  showAllArtistsKey,
                  e.target.checked ? "1" : "0"
                );
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Show all artists"
            secondary="Don't show alphabet on Artists page. Can be much slower."
          />
        </ListItem>
      </List>
    </PageLayout>
  );
}
