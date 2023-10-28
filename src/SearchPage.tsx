import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { LocalDbSearchResult, searchLocalDb } from "./localdb";
import { Alert, Box, CircularProgress, List } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import ArtistListItem from "./ArtistListItem";
import SongListItem from "./SongListItem";
import _ from "lodash";

export default function SearchPage() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");

  const query = useQuery<LocalDbSearchResult>({
    queryKey: ["search", filter],
    queryFn: () => searchLocalDb(filter),
    networkMode: "always",
  });

  const sendRequest = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const debouncedSendRequest = useMemo(() => {
    return _.debounce(sendRequest, 500);
  }, [sendRequest]);

  useEffect(() => {
    debouncedSendRequest(searchText);
  }, [searchText, debouncedSendRequest]);

  return (
    <PageLayout onChangeSearchText={setSearchText} searchText={searchText}>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : !query.data.searchDone ? (
        <Box sx={{ m: 1 }}>Please specify some search criteria</Box>
      ) : query.data.artists.length == 0 && query.data.songs.length == 0 ? (
        <>
          <Box sx={{ m: 1 }}>No songs found</Box>
        </>
      ) : (
        <List>
          {query.data.artists.slice(0, 100).map((artist) => (
            <ArtistListItem key={artist.name} artist={artist} />
          ))}
          {query.data.songs.slice(0, 100).map((song) => (
            <SongListItem key={song.id} song={song} />
          ))}
        </List>
      )}
    </PageLayout>
  );
}
