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
  showArtistInDescription?: boolean;
}) {
  const {
    song,
    showArtist,
    showIcon = true,
    showDatabase,
    showArtistInDescription,
  } = props;
  const navigate = useNavigate();

  const { text } = parseSongParts(song.source);
  // const textPart = text?.replace(/^#\s*.*$/m, "")?.substring(0, 200);
  const textPart = text?.substring(0, 200);

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
          showArtistInDescription
            ? showDatabase
              ? `${song.artist} (${song?.databaseTitle?.toLocaleLowerCase()})`
              : song.artist
            : showDatabase
            ? `${song?.databaseTitle?.toLocaleLowerCase()}: ${textPart}`
            : textPart
        }
      />
    </ListItemButton>
  );
}
