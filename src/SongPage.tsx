import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists, getSong } from "./localdb";
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { LocalArtist, LocalSong } from "./types";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate, useParams } from "react-router-dom";

export default function SongPage() {
  const { songid } = useParams();

  const query = useQuery<LocalSong | undefined>({
    queryKey: ["song", songid],
    queryFn: () => getSong(songid!),
  });

  return (
    <PageLayout title={query.data?.title ?? "Loading..."} showBack>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <Typography>{query.data?.text}</Typography>
      )}
    </PageLayout>
  );
}
