import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import { Alert, Box, CircularProgress, Grid, List } from "@mui/material";
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
            You have no active songs in your database. Please download some
            songs in "Databases" section. Only songs from checked databases are
            active.
          </Box>
          <Box sx={{ m: 1 }}>
            <Link to="/databases">Go to Databases</Link>
          </Box>
        </>
      ) : (
        <Grid container>
          {query.data.map((artist) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={artist.name}>
              <ArtistListItem
                artist={artist}
                key={artist.name}
                showIcon={false}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
}
