import { Box, Fab, Grid, IconButton, List, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useRef, useState } from "react";
import { removeDiacritics } from "./utils";
import NavigationIcon from "@mui/icons-material/Navigation";

export default function BigListView<T>(props: {
  array: T[];
  factory: (item: T, showIcon: boolean) => JSX.Element;
  extractKey: (item: T) => any;
  extractTitle: (item: T) => any;
}) {
  const { array, factory, extractKey, extractTitle } = props;

  const [visibleNavigation, setVisibleMavigation] = useState(
    array.length > 100
  );

  const firstRefs = useRef<Record<string, Element | null>>({});

  const firstLetters = useMemo(() => {
    const letters: string[] = [];
    const firstIds: Record<string, string> = {};
    for (const item of array) {
      const letter = removeDiacritics(extractTitle(item))
        .trim()[0]
        .toUpperCase();
      if (!letters.includes(letter)) {
        letters.push(letter);
        firstIds[extractKey(item)] = letter;
      }
    }
    return { letters, firstIds };
  }, [array, extractTitle, extractKey]);

  const sizing = useMemo(
    () =>
      array.length > 40
        ? {
            xs: 6,
            sm: 4,
            md: 3,
            lg: 3,
          }
        : array.length > 30
        ? {
            xs: 6,
            sm: 4,
            md: 3,
          }
        : array.length > 20
        ? {
            xs: 6,
            sm: 4,
          }
        : array.length > 10
        ? {
            xs: 6,
          }
        : null,
    [array]
  );

  if (sizing == null) {
    return <List>{array.map((item) => factory(item, true))}</List>;
  }

  return (
    <>
      <Grid container>
        {array.map((item) => (
          <Grid item {...sizing} key={extractKey(item)}>
            <div
              ref={
                firstLetters.firstIds[extractKey(item)]
                  ? (x) =>
                      (firstRefs.current[
                        firstLetters.firstIds[extractKey(item)]
                      ] = x)
                  : undefined
              }
            >
              {factory(item, false)}
            </div>
          </Grid>
        ))}
      </Grid>

      {visibleNavigation && (
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
          {firstLetters.letters.map((letter) => (
            <IconButton
              key={letter}
              onClick={() => {
                firstRefs.current[letter]?.scrollIntoView(true);
                window.scrollBy(0, -70);
              }}
            >
              <span>{letter}</span>
            </IconButton>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={() => setVisibleMavigation(false)}>
            <CloseIcon />
          </IconButton>
        </Paper>
      )}

      {!visibleNavigation && array.length > 100 && (
        <Fab
          color="primary"
          style={{ position: "fixed", bottom: 40, right: 20 }}
          onClick={() => setVisibleMavigation(true)}
        >
          <NavigationIcon sx={{ mr: 1 }} />
        </Fab>
      )}
    </>
  );
}
