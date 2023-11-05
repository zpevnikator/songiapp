import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import {
  findArtists,
  findArtistsByLetter,
  findActiveLetters,
  getDatabase,
} from "./localdb";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  List,
  Paper,
  useTheme,
} from "@mui/material";
import {
  GroupedLetter,
  LocalArtist,
  LocalDatabase,
  LocalLetter,
} from "./types";
import { Link, useParams } from "react-router-dom";
import ArtistListItem from "./ArtistListItem";
import BigListView from "./BigListView";
import { useCallback, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useSettings } from "./SettingsProvider";

const startLetterKey = "artistsStartLetter";

async function loadArtistsData(
  letter: string | null,
  showAllArtists: boolean,
  dbid?: string
): Promise<[GroupedLetter[], LocalArtist[]]> {
  const letters = await findActiveLetters(dbid);

  if (showAllArtists) {
    return [letters, await findArtists(dbid)];
  }

  if (letter) {
    return [letters, await findArtistsByLetter(letter, dbid)];
  }

  if (letters.length > 0) {
    return [letters, await findArtistsByLetter(letters[0].letter, dbid)];
  }

  return [letters, await findArtists(dbid)];
}

function LetterList(props: {
  letter: string | null;
  letters: GroupedLetter[];
  onSetLetter?: Function;
}) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        mx: 1,
        display: "flex",
        flexWrap: "wrap",
        zIndex: 1,
      }}
    >
      {props.letters.map((x, index) => (
        <IconButton
          key={x.letter}
          onClick={() => {
            props.onSetLetter?.(x.letter);
          }}
        >
          <span
            style={
              props.letter == x.letter || (props.letter == null && index == 0)
                ? { color: theme.palette.primary.main }
                : {}
            }
          >
            {x.letter}
          </span>
        </IconButton>
      ))}
    </Paper>
  );
}

export default function ArtistListPage() {
  const { dbid } = useParams();

  const [letter, setLetter] = useState<string | null>(
    localStorage.getItem(startLetterKey)
  );

  const { showAllArtists } = useSettings();

  const query = useQuery<[GroupedLetter[], LocalArtist[]]>({
    queryKey: ["artist-data", letter || "__no_selected__", dbid],
    queryFn: () => loadArtistsData(letter, showAllArtists, dbid),
    networkMode: "always",
  });

  const dbQuery = useQuery<LocalDatabase | undefined>({
    queryKey: ["selected-database", dbid],
    queryFn: () => getDatabase(dbid ?? ""),
    networkMode: "always",
  });

  const extractKey = useCallback((artist) => artist.id, []);
  const extractTitle = useCallback((artist) => artist.name, []);

  useEffect(() => {
    if (query.data && letter && !showAllArtists) {
      if (!query.data[0].find((x) => x.letter == letter)) {
        // if does not exist in active DBs
        setLetter(null);
        localStorage.removeItem(startLetterKey);
      }
    }
  }, [letter, query]);

  return (
    <PageLayout
      title={
        dbQuery.data
          ? `Artists (${dbQuery.data.title?.toLocaleLowerCase()})`
          : "Artists"
      }
      showSearchLink
    >
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : query.data[1].length == 0 ? (
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
        <div>
          <Box
            sx={{
              position: "fixed",
              mt: 8,
              top: 0,
              zIndex: 100,
            }}
          >
            {!showAllArtists && (
              <LetterList
                letters={query.data[0]}
                letter={letter}
                onSetLetter={(x) => {
                  setLetter(x);
                  localStorage.setItem(startLetterKey, x);
                }}
              />
            )}
          </Box>
          <BigListView
            disableNavigation={!showAllArtists}
            array={query.data[1]}
            factory={(artist, showIcon) => (
              <ArtistListItem
                artist={artist}
                key={artist.id}
                showIcon={false}
              />
            )}
            extractKey={extractKey}
            extractTitle={extractTitle}
            prefix={
              showAllArtists ? undefined : (
                <Box sx={{ visibility: "hidden" }}>
                  <LetterList letters={query.data[0]} letter={letter} />
                </Box>
              )
            }
          />
        </div>
      )}
    </PageLayout>
  );
}
