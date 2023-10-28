import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalArtist } from "./types";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

export default function ArtistListPage() {
  const navigate = useNavigate();
  const query = useQuery<LocalArtist[]>({
    queryKey: ["artists"],
    queryFn: findArtists,
    networkMode: "always",
  });

  return (
    <PageLayout title="Artists">
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <List>
          {query.data.map((artist) => (
            <ListItemButton
              key={artist.name}
              onClick={() =>
                navigate(`/by-artist/${encodeURIComponent(artist.name)}`)
              }
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary={artist.name}
                secondary={`${artist.songCount} songs`}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </PageLayout>
  );
}
