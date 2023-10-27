import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists } from "./localdb";
import { Alert, CircularProgress } from "@mui/material";

export default function ArtistListPage() {
  const query = useQuery<string[]>({
    queryKey: ["artists"],
    queryFn: findArtists,
  });

  return (
    <PageLayout title='Artists'>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        query.data.map((artist) => <div>{artist}</div>)
      )}
    </PageLayout>
  );
}
