import { Grid, List } from "@mui/material";

export default function BigListView<T>(props: {
  array: T[];
  factory: (item: T, showIcon: boolean) => JSX.Element;
  extractKey: (item: T) => any;
}) {
  const { array, factory, extractKey } = props;

  const sizing =
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
      : null;

  if (sizing == null) {
    return <List>{array.map((item) => factory(item, true))}</List>;
  }

  return (
    <Grid container>
      {array.map((item) => (
        <Grid item {...sizing} key={extractKey(item)}>
          {factory(item, false)}
        </Grid>
      ))}
    </Grid>
  );
}
