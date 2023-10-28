import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { LocalSong } from "./types";
import LyricsIcon from "@mui/icons-material/Lyrics";
import { useNavigate } from "react-router-dom";

export default function SongListItem(props: { song: LocalSong }) {
  const { song } = props;
  const navigate = useNavigate();

  return (
    <ListItemButton
      onClick={() => navigate(`/songs/${encodeURIComponent(song.id)}`)}
    >
      <ListItemIcon>
        <LyricsIcon />
      </ListItemIcon>
      <ListItemText
        secondaryTypographyProps={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
        primary={song.title}
        secondary={song?.text?.replace(/^\..*$/m, "")?.substring(0, 200)}
      />
    </ListItemButton>
  );
}
