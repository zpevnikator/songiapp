import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import { Alert, Box, CircularProgress, Grid, List } from "@mui/material";
import { LocalArtist } from "./types";
import { Link } from "react-router-dom";
import ArtistListItem from "./ArtistListItem";
import BigListView from "./BigListView";
import { useCallback } from "react";

export default function ArtistListPage() {
  const query = useQuery<LocalArtist[]>({
    queryKey: ["artists"],
    queryFn: findArtists,
    networkMode: "always",
  });

  const extractKey = useCallback((artist) => artist.name, []);
  const extractTitle = useCallback((artist) => artist.name, []);

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
        <BigListView
          array={query.data}
          factory={(artist, showIcon) => (
            <ArtistListItem
              artist={artist}
              key={artist.name}
              showIcon={false}
            />
          )}
          extractKey={extractKey}
          extractTitle={extractTitle}
        />
      )}
    </PageLayout>
  );
}
