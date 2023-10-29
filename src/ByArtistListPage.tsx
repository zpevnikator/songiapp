import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findSongsByArtist } from "./localdb";
import { Alert, CircularProgress, Grid, List } from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
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
        <Grid container>
          {query.data.map((song) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={song.id}>
              <SongListItem song={song} key={song.id} showIcon={false} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
}
