import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import {
  addRecentArtist,
  findSongsByArtist,
  findSongsByDatabase,
  findSongsByRange,
  getActivceSongCount,
  getArtist,
  getDatabase,
} from "./localdb";
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  List,
} from "@mui/material";
import { LocalArtist, LocalDatabase, LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongListItem from "./SongListItem";
import BigListView from "./BigListView";
import { useEffect, useState } from "react";
import _ from "lodash";
import { useIntl } from "react-intl";
import { localeSortByKey } from "./utils";
import LeftIcon from "@mui/icons-material/ArrowBack";
import RightIcon from "@mui/icons-material/ArrowForward";

const PAGE_SIZE = 100;

export default function SongListPage() {
  const { dbid } = useParams();
  const intl = useIntl();

  const [page, setPage] = useState(0);

  const querySongs = useQuery<LocalSong[]>({
    queryKey: ["songs-by-db", dbid, page],
    queryFn: () => findSongsByRange(page * PAGE_SIZE, PAGE_SIZE, dbid),
    networkMode: "always",
  });

  const dbQuery = useQuery<LocalDatabase | undefined>({
    queryKey: ["selected-database", dbid],
    queryFn: () => getDatabase(dbid ?? ""),
    networkMode: "always",
  });

  const songCountQuery = useQuery<number>({
    queryKey: ["all-song-count", dbid],
    queryFn: getActivceSongCount,
    networkMode: "always",
  });

  const showPaging = !dbid || (dbQuery?.data?.songCount ?? 0) > PAGE_SIZE;
  const pageCount = Math.ceil(
    ((dbid ? dbQuery?.data?.songCount : songCountQuery?.data) ?? 0) / PAGE_SIZE
  );

  const titleBase = dbid
    ? dbQuery.data
      ? dbQuery.data?.title
      : intl.formatMessage({ id: "loading", defaultMessage: "Loading" })
    : intl.formatMessage({ id: "songs", defaultMessage: "Songs" });
  const pagingTitle = showPaging ? `${page + 1}/${pageCount}` : null;

  return (
    <PageLayout
      title={pagingTitle ? `${titleBase} (${pagingTitle})` : titleBase}
      headerButtons={
        showPaging ? (
          <>
            <IconButton
              size="large"
              aria-label="prev"
              edge="end"
              color="inherit"
              onClick={(e) => {
                setPage((x) => x - 1);
              }}
              disabled={page <= 0}
            >
              <LeftIcon />
            </IconButton>

            <IconButton
              size="large"
              aria-label="prev"
              edge="end"
              color="inherit"
              onClick={(e) => {
                setPage((x) => x + 1);
              }}
              disabled={page >= pageCount - 1}
            >
              <RightIcon />
            </IconButton>
          </>
        ) : null
      }
    >
      {querySongs.isPending ? (
        <CircularProgress />
      ) : querySongs.error ? (
        <Alert severity="error">{querySongs.error.message}</Alert>
      ) : (
        <BigListView
          array={localeSortByKey(querySongs.data, "title")}
          factory={(song, showIcon) => (
            <SongListItem
              song={song}
              key={song.id}
              showIcon={showIcon}
              showArtistInDescription
              showDatabase={!dbid}
            />
          )}
          extractKey={(song) => song.id}
          extractTitle={(song) => song.title}
        />
      )}
    </PageLayout>
  );
}
