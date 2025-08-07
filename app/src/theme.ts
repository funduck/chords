import { createTheme, virtualColor } from "@mantine/core";

export const theme = createTheme({
  /** Put your mantine theme override here */

  colors: {
    "light-bg": [
      "rgb(112, 69, 69)",
      "rgb(188, 91, 91)",
      "rgb(159, 105, 105)",
      "rgb(194, 194, 194)",
      "rgb(194, 194, 194)",
      "rgb(194, 194, 194)",
      "rgb(245, 245, 245)", // This matters
      "rgb(88, 48, 48)",
      "rgb(195, 85, 85)",
      "rgb(205, 93, 93)",
    ],
    "dark-bg": [
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(68, 68, 68)",
      "rgb(28, 28, 28)", // This matters
      "rgb(68, 68, 68)",
    ],

    "header-bg": virtualColor({
      name: "header-bg",
      light: "light-bg",
      dark: "dark-bg",
    }),

    "navbar-bg": virtualColor({
      name: "navbar-bg",
      light: "light-bg",
      dark: "dark-bg",
    }),

    primary: virtualColor({
      name: "primary",
      light: "dark",
      dark: "gray",
    }),

    chord: virtualColor({
      name: "chord",
      light: "blue",
      dark: "blue",
    }),

    lyrics: virtualColor({
      name: "lyrics",
      light: "dark",
      dark: "",
    }),

    chorus: virtualColor({
      name: "chorus",
      light: "dark",
      dark: "gray",
    }),
  },
});
