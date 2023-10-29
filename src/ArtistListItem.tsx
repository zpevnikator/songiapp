import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { LocalArtist } from "./types";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";

export default function ArtistListItem(props: {
  artist: LocalArtist;
  showIcon?: boolean;
}) {
  const navigate = useNavigate();
  const { artist, showIcon = true } = props;
  return (
    <ListItemButton
      onClick={() => navigate(`/by-artist/${encodeURIComponent(artist.name)}`)}
    >
      {showIcon && (
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
      )}
      <ListItemText
        primary={artist.name}
        secondary={`${artist.songCount} songs`}
      />
    </ListItemButton>
  );
}
