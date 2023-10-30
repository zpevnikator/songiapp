import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findArtists, findArtistsByLetter, findLetters } from "./localdb";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  List,
  Paper,
} from "@mui/material";
import { LocalArtist, LocalLetter } from "./types";
import { Link } from "react-router-dom";
import ArtistListItem from "./ArtistListItem";
import BigListView from "./BigListView";
import { useCallback, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const startLetterKey = "artistsStartLetter";

async function loadArtistsData(
  letter: string | null
): Promise<[LocalLetter[], LocalArtist[]]> {
  const letters = await findLetters();

  if (letter == "__all__") {
    return [letters, await findArtists()];
  }

  if (letter) {
    return [letters, await findArtistsByLetter(letter)];
  }

  if (letters.length > 0) {
    return [letters, await findArtistsByLetter(letters[0].letter)];
  }

  return [letters, await findArtists()];
}

function LetterList(props: {
  letter: string | null;
  letters: LocalLetter[];
  onSetLetter?: Function;
}) {
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
            className={
              props.letter == x.letter || (props.letter == null && index == 0)
                ? "selected-transpose"
                : ""
            }
          >
            {x.letter}
          </span>
        </IconButton>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="text" onClick={() => props.onSetLetter?.("__all__")}>
        Show all
      </Button>
    </Paper>
  );
}

export default function ArtistListPage() {
  const [letter, setLetter] = useState<string | null>(
    localStorage.getItem(startLetterKey)
  );

  const showAll = letter == "__all__";

  const query = useQuery<[LocalLetter[], LocalArtist[]]>({
    queryKey: ["artist-data", letter || "__no_selected__"],
    queryFn: () => loadArtistsData(letter),
    networkMode: "always",
  });

  const extractKey = useCallback((artist) => artist.id, []);
  const extractTitle = useCallback((artist) => artist.name, []);

  useEffect(() => {
    if (query.data && letter && letter != "__all__") {
      if (!query.data[0].find((x) => x.letter == letter)) {
        // if does not exist in active DBs
        setLetter(null);
        localStorage.removeItem(startLetterKey);
      }
    }
  }, [letter, query]);

  return (
    <PageLayout title="Artists" showSearchLink>
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
            {!showAll && (
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
            disableNavigation={!showAll}
            onSwitchToFilter={
              showAll
                ? () => {
                    setLetter(null);
                    localStorage.removeItem(startLetterKey);
                  }
                : undefined
            }
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
              showAll ? undefined : (
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
