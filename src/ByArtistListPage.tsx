import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findSongsByArtist } from "./localdb";
import {
  Alert,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalSong } from "./types";
import LyricsIcon from "@mui/icons-material/Lyrics";
import { useNavigate, useParams } from "react-router-dom";
import SongListItem from "./SongListItem";

export default function ByArtistListPage() {
  const { artist } = useParams();

  const query = useQuery<LocalSong[]>({
    queryKey: ["songs-by-artist", artist],
    queryFn: () => findSongsByArtist(artist!),
    networkMode: "always",
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
            <SongListItem song={song} key={song.id} />
          ))}
        </List>
      )}
    </PageLayout>
  );
}
