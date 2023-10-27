import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists, findSongsByArtist } from "./localdb";
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalArtist, LocalSong } from "./types";
import LyricsIcon from "@mui/icons-material/Lyrics";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ByArtistListPage() {
  const navigate = useNavigate();
  const { artist } = useParams();

  const query = useQuery<LocalSong[]>({
    queryKey: ["songs-by-artist", artist],
    queryFn: () => findSongsByArtist(artist!),
  });

  return (
    <PageLayout title={artist} showBack>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <List>
          {query.data.map((song) => (
            <ListItemButton
              key={song.id}
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
          ))}
        </List>
      )}
    </PageLayout>
  );
}
