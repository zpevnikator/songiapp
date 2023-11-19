import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { LocalArtist } from "./types";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import { useIntl } from "react-intl";

export default function ArtistListItem(props: {
  artist: LocalArtist;
  showIcon?: boolean;
}) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { artist, showIcon = true } = props;
  return (
    <ListItemButton
      onClick={() => navigate(`/by-artist/${encodeURIComponent(artist.id)}`)}
    >
      {showIcon && (
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
      )}
      <ListItemText
        primary={artist.name}
        secondary={`${artist.songCount} ${intl.formatMessage({
          id: "songs.lower",
          defaultMessage: "songs",
        })} (${artist.databaseTitle?.toLocaleLowerCase()})`}
      />
    </ListItemButton>
  );
}
