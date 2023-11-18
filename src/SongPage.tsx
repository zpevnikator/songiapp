import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { addRecentSong, getSong } from "./localdb";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongFormatter from "./SongFormatter";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBaseTone, transposeText } from "./chordTools";
import _ from "lodash";

export interface LayoutOptions {
  columns: 1 | 2 | 3;
}

function divideText(text: string, columns: number): string[] {
  if (columns == 1) {
    return [text];
  }
  const lines = text.split("\n");

  return _.range(0, columns).map((index) =>
    lines
      .slice(
        Math.round((lines.length / columns) * index),
        index == columns - 1
          ? undefined
          : Math.round((lines.length / columns) * (index + 1))
      )
      .join("\n")
  );
}

export default function SongPage() {
  const { songid } = useParams();

  const wakeLockRef = useRef<any>(null);

  const [layout, setLayout] = useState<LayoutOptions>({ columns: 1 });

  const query = useQuery<LocalSong | undefined>({
    queryKey: ["song", songid],
    queryFn: () => getSong(songid!),
    networkMode: "always",
  });

  const [transpDiff, setTranspDiff] = useState(0);
  const transposedText = useMemo(
    () =>
      transpDiff
        ? transposeText(query.data?.text ?? "", transpDiff)
        : query.data?.text,
    [query.data?.text, transpDiff]
  );
  const textColumns = useMemo(
    () => divideText(transposedText ?? "", layout.columns),
    [transposedText, layout.columns]
  );

  useEffect(() => {
    if (query.data) {
      addRecentSong(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if ("wakeLock" in navigator) {
      const navigatorWakeLock = navigator.wakeLock as any;
      navigatorWakeLock
        .request("screen")
        .then((lock) => (wakeLockRef.current = lock));
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
    };
  }, []);

  const theme = useTheme();

  return (
    <PageLayout
      title={query.data?.title ?? "Loading..."}
      showBack
      rightDrawerContent={
        <>
          <Typography variant="h5" sx={{ m: 2 }}>
            Tranpose
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ m: 1 }}
              onClick={() => setTranspDiff(0)}
            >
              Reset
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ m: 1 }}
              onClick={() => setTranspDiff((x) => x - 1)}
            >
              -1
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ m: 1 }}
              onClick={() => setTranspDiff((x) => x + 1)}
            >
              +1
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ m: 1 }}
              onClick={() => setTranspDiff((x) => x - 2)}
            >
              -2
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ m: 1 }}
              onClick={() => setTranspDiff((x) => x + 2)}
            >
              +2
            </Button>
          </Box>
          <Typography variant="h5" sx={{ m: 2 }}>
            Layout
          </Typography>
          <div>
            <Checkbox
              checked={layout.columns == 1}
              onChange={(e) => setLayout({ ...layout, columns: 1 })}
            />
            1 column
          </div>
          <div>
            <Checkbox
              checked={layout.columns == 2}
              onChange={(e) => setLayout({ ...layout, columns: 2 })}
            />
            2 columns
          </div>
          <div>
            <Checkbox
              checked={layout.columns == 3}
              onChange={(e) => setLayout({ ...layout, columns: 3 })}
            />
            3 columns
          </div>
        </>
      }
    >
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <Grid container>
          {textColumns.map((textColumn, index) => (
            <Grid item xs={12 / layout.columns} key={index}>
              <Typography sx={{ m: 1 }}>
                {new SongFormatter(
                  textColumn,
                  theme.palette.primary.main
                ).format()}
              </Typography>
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
}
