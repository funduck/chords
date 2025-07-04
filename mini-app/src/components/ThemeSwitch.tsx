import { Button, MantineColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Theme = MantineColorScheme;

function ThemeSwitch() {
  const { setColorScheme } = useMantineColorScheme();

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") || "light") as Theme;
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    setColorScheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Button variant="subtle" justify="start" id="theme-switch" onClick={toggleTheme}>
      {theme === "light" ? (
        <IconMoon color="var(--mantine-color-text)" />
      ) : (
        <IconSun color="var(--mantine-color-text)" />
      )}
    </Button>
  );
}

export default ThemeSwitch;
