import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { LocalSong } from "./types";
import LyricsIcon from "@mui/icons-material/Lyrics";
import { useNavigate } from "react-router-dom";
import { parseSongParts } from "./songpro";

export default function SongListItem(props: {
  song: LocalSong;
  showArtist?: boolean;
  showIcon?: boolean;
  showDatabase?: boolean;
}) {
  const { song, showArtist, showIcon = true, showDatabase } = props;
  const navigate = useNavigate();

  const { text } = parseSongParts(song.source);
  const textPart = text?.replace(/^\..*$/m, "")?.substring(0, 200);

  return (
    <ListItemButton onClick={() => navigate(`/songs/${song.id}`)}>
      {showIcon && (
        <ListItemIcon>
          <LyricsIcon />
        </ListItemIcon>
      )}
      <ListItemText
        secondaryTypographyProps={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
        primary={showArtist ? `${song.title} (${song.artist})` : song.title}
        secondary={
          showDatabase
            ? `${song?.databaseTitle?.toLocaleLowerCase()}: ${textPart}`
            : textPart
        }
      />
    </ListItemButton>
  );
}
