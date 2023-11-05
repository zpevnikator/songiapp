import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { addRecentSong, getSong } from "./localdb";
import {
  Alert,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongFormatter from "./SongFormatter";
import { useEffect, useMemo, useRef, useState } from "react";
import TransposePanel from "./TransposePanel";
import { getBaseTone, transposeText } from "./chordTools";
import LayoutPanel, { LayoutOptions } from "./LayoutPanel";
import _ from "lodash";

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

  const [toolPanel, setToolPanel] = useState<"transpose" | "layout" | null>(
    null
  );
  const baseTone = useMemo(
    () => getBaseTone(query.data?.text),
    [query.data?.text]
  );
  const [newBaseTone, setNewBaseTone] = useState(null);
  const transposedText = useMemo(
    () =>
      newBaseTone != null && baseTone != null
        ? transposeText(query.data?.text ?? "", newBaseTone - baseTone)
        : query.data?.text,
    [query.data?.text, newBaseTone, baseTone]
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
      menuItems={[
        {
          text: "Transpose",
          onClick: () => setToolPanel("transpose"),
        },
        {
          text: "Layout",
          onClick: () => setToolPanel("layout"),
        },
      ]}
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
      {toolPanel == "transpose" && (
        <TransposePanel
          tone={newBaseTone ?? baseTone}
          onChange={setNewBaseTone}
          onClose={() => setToolPanel(null)}
        />
      )}
      {toolPanel == "layout" && (
        <LayoutPanel
          value={layout}
          onChange={setLayout}
          onClose={() => setToolPanel(null)}
        />
      )}
    </PageLayout>
  );
}
