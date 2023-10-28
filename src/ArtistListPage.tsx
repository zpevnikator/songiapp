import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import { Alert, Box, CircularProgress, List } from "@mui/material";
import { LocalArtist } from "./types";
import { Link } from "react-router-dom";
import ArtistListItem from "./ArtistListItem";

export default function ArtistListPage() {
  const query = useQuery<LocalArtist[]>({
    queryKey: ["artists"],
    queryFn: findArtists,
    networkMode: "always",
  });

  return (
    <PageLayout title="Artists" showSearchLink>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : query.data.length == 0 ? (
        <>
          <Box sx={{ m: 1 }}>
            You have no songs in your database. Please download some songs in
            "Downloads" section.
          </Box>
          <Box sx={{ m: 1 }}>
            <Link to="/download">Go to Downloads</Link>
          </Box>
        </>
      ) : (
        <List>
          {query.data.map((artist) => (
            <ArtistListItem artist={artist} key={artist.name} />
          ))}
        </List>
      )}
    </PageLayout>
  );
}
