import { Box, Checkbox, IconButton, Paper, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TONE_BASE_NAMES, TONE_HEIGHTS } from "./chordTools";

export interface LayoutOptions {
  columns: 1 | 2 | 3;
}

export default function LayoutPanel(props: {
  value: LayoutOptions;
  onChange: (newValue: LayoutOptions) => void;
  onClose: () => void;
}) {
  const { value, onChange, onClose } = props;
  const theme = useTheme();
  return (
    <Paper
      style={{
        position: "fixed",
        padding: 10,
        bottom: 0,
        margin: 5,
        display: "flex",
        flexWrap: "wrap",
        zIndex: 1,
      }}
    >
      <div>
        <Checkbox
          checked={value.columns == 1}
          onChange={(e) => onChange({ ...value, columns: 1 })}
        />
        1 column
      </div>
      <div>
        <Checkbox
          checked={value.columns == 2}
          onChange={(e) => onChange({ ...value, columns: 2 })}
        />
        2 columns
      </div>
      <div>
        <Checkbox
          checked={value.columns == 3}
          onChange={(e) => onChange({ ...value, columns: 3 })}
        />
        3 columns
      </div>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton onClick={() => onClose()}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
}
