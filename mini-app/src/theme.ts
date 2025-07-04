import { createTheme, virtualColor } from "@mantine/core";

export const theme = createTheme({
  /** Put your mantine theme override here */

  colors: {
    chord: virtualColor({
      name: "chord",
      light: "blue",
      dark: "light",
    }),

    lyrics: virtualColor({
      name: "lyrics",
      light: "dark",
      dark: "light",
    }),
  },
});
