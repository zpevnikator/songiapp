import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { getSong } from "./localdb";
import {
  Alert,
  Card,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongFormatter from "./SongFormatter";
import { useMemo, useState } from "react";
import TransposePanel from "./TransposePanel";
import { getBaseTone, transposeText } from "./chordTools";

export default function SongPage() {
  const { songid } = useParams();

  const query = useQuery<LocalSong | undefined>({
    queryKey: ["song", songid],
    queryFn: () => getSong(songid!),
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
