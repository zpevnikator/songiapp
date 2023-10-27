import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists, fondSongsByArtist } from "./localdb";
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
    queryFn: () => fondSongsByArtist(artist!),
  });

  return (
    <PageLayout title={artist}>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <List>
          {query.data.map((song) => (
            <ListItemButton onClick={() => navigate(`/songs/${song.id}`)}>
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
                secondary={song?.text?.substring(0, 100)}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </PageLayout>
  );
}
