import { Box, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TONE_BASE_NAMES, TONE_HEIGHTS } from "./chordTools";

export default function TransposePanel({ tone, onChange, onClose }) {
  return (
    <Paper
      style={{
        position: "fixed",
        bottom: 0,
        padding: 10,
        margin: 5,
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {TONE_BASE_NAMES.map((name) => (
        <IconButton onClick={() => onChange(TONE_HEIGHTS[name])}>
          <span
            className={tone == TONE_HEIGHTS[name] ? "selected-transpose" : ""}
          >
            {name}
          </span>
        </IconButton>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <IconButton onClick={() => onClose()}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
}
