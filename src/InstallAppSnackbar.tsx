import { Button, IconButton, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

export default function InstallAppSnackbar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installClicked, setInstallClicked] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  return (
    <Snackbar
      open={!!deferredPrompt && !installClicked}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message="SongiApp is prepared for offline usage, you can install it as normal app"
      onClose={() => setDeferredPrompt(null)}
      action={
        <>
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              deferredPrompt.prompt();
              setInstallClicked(true);
              setDeferredPrompt(null);
            }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setDeferredPrompt(null)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
}
