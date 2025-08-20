import { colorsTuple, createTheme, virtualColor } from "@mantine/core";

export const theme = createTheme({
  /** Put your mantine theme override here */

  colors: {
    "light-bg": colorsTuple("rgb(245, 245, 245)"),
    "dark-bg": colorsTuple("rgb(28, 28, 28)"),

    "dark-fg": colorsTuple("rgba(240, 240, 240, 1)"),

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
      dark: "dark-fg",
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
