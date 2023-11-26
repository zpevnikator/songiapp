import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; text: string }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ textWrap: "nowrap", mr: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {props.text}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FreeSpaceProgressBar({ live }) {
  const [estimate, setEstimate] = useState<any>(null);

  async function loadEstimate() {
    try {
      const estimate = await navigator.storage.estimate();
      setEstimate(estimate);
    } catch (e) {
      setEstimate(null);
    }
  }

  useEffect(() => {
    if (!navigator?.storage?.estimate) {
      return;
    }

    loadEstimate();
    if (live) {
      const intervalId = setInterval(() => {
        loadEstimate();
      }, 1000); // in milliseconds
      return () => clearInterval(intervalId);
    }
  }, [live]);

  if (estimate) {
    const percentage = (estimate.usage / estimate.quota) * 100;
    return (
      <LinearProgressWithLabel
        value={percentage}
        text={`${Math.round(estimate.usage / 1024 / 1024)} MB, ${Math.round(
          percentage
        )}%`}
      />
    );
  }
  return null;
}
