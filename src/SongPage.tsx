import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { addRecentSong, getSong } from "./localdb";
import { Alert, CircularProgress, Typography } from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongFormatter from "./SongFormatter";
import { useEffect, useMemo, useRef, useState } from "react";
import TransposePanel from "./TransposePanel";
import { getBaseTone, transposeText } from "./chordTools";

export default function SongPage() {
  const { songid } = useParams();

  const wakeLockRef = useRef<any>(null);

  const query = useQuery<LocalSong | undefined>({
    queryKey: ["song", songid],
    queryFn: () => getSong(songid!),
    networkMode: "always",
  });

  const [showTranspose, setShowTranspose] = useState(false);
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

  return (
    <PageLayout
      title={query.data?.title ?? "Loading..."}
      showBack
      menuItems={[
        {
          text: "Transpose",
          onClick: () => setShowTranspose(true),
        },
      ]}
    >
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <Typography sx={{ m: 1 }}>
          {new SongFormatter(transposedText).format()}
        </Typography>
      )}
      {showTranspose && (
        <TransposePanel
          tone={newBaseTone ?? baseTone}
          onChange={setNewBaseTone}
          onClose={() => setShowTranspose(false)}
        />
      )}
    </PageLayout>
  );
}
