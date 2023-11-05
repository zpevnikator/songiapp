import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { LocalDbSearchResult, findAllRecents, searchLocalDb } from "./localdb";
import { Alert, Box, CircularProgress, List } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import ArtistListItem from "./ArtistListItem";
import SongListItem from "./SongListItem";
import _ from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import { LocalRecentObject } from "./types";

function RecentObjectItem(props: { item: LocalRecentObject }) {
  const { item } = props;

  if (item.type == "song") {
    return <SongListItem song={item.song} showDatabase />;
  }

  if (item.type == "artist") {
    return <ArtistListItem artist={item.artist} />;
  }

  return null;
}

function RecentObjectList(props: { list: LocalRecentObject[] }) {
  return (
    <List>
      {props.list.map((item) => (
        <RecentObjectItem key={item.id} item={item} />
      ))}
    </List>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState(location.state?.search ?? "");
  const [filter, setFilter] = useState(location.state?.search ?? "");

  const searchQuery = useQuery<LocalDbSearchResult>({
    queryKey: ["search", filter],
    queryFn: () => searchLocalDb(filter),
    networkMode: "always",
  });

  const recentsQuery = useQuery<LocalRecentObject[]>({
    queryKey: ["recents", filter],
    queryFn: findAllRecents,
    networkMode: "always",
  });

  const sendRequest = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const debouncedSendRequest = useMemo(() => {
    return _.debounce(sendRequest, 500);
  }, [sendRequest]);

  useEffect(() => {
    navigate(".", { replace: true, state: { search: searchText } });
    debouncedSendRequest(searchText);
  }, [searchText, debouncedSendRequest]);

  return (
    <PageLayout onChangeSearchText={setSearchText} searchText={searchText}>
      {searchQuery.isPending || recentsQuery.isPending ? (
        <CircularProgress />
      ) : searchQuery.error ? (
        <Alert severity="error">{searchQuery.error.message}</Alert>
      ) : !searchQuery.data.searchDone ? (
        (recentsQuery.data?.length ?? 0) > 0 ? (
          <RecentObjectList list={recentsQuery.data!} />
        ) : (
          <Box sx={{ m: 1 }}>Please specify some search criteria. Each searched word must contain at least two letters, single letters and numbers are ignored.</Box>
        )
      ) : searchQuery.data.artists.length == 0 &&
        searchQuery.data.songs.length == 0 ? (
        <>
          <Box sx={{ m: 1 }}>No songs found</Box>
        </>
      ) : (
        <List>
          {searchQuery.data.artists.map((artist) => (
            <ArtistListItem key={artist.name} artist={artist} />
          ))}
          {searchQuery.data.songs.map((song) => (
            <SongListItem key={song.id} song={song} showArtist showDatabase />
          ))}
        </List>
      )}
    </PageLayout>
  );
}
