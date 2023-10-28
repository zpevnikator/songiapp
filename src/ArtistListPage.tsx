import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import {
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalArtist } from "./types";
import PeopleIcon from "@mui/icons-material/People";
import { Link, useNavigate } from "react-router-dom";

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
      ) : query.data.length == 0 ? (
        <>
          <Box sx={{ m: 1 }}>
            You have no songs in your database. 
            Please download some songs in "Downloads" section.
          </Box>
          <Box sx={{ m: 1 }}>
            <Link to="/download">Go to Downloads</Link>
          </Box>
        </>
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
