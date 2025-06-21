import { Button, MantineColorScheme, useMantineColorScheme } from "@mantine/core";
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
    <Button variant="outline" color="gray" id="theme-switch" onClick={toggleTheme}>
      {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    </Button>
  );
}

export default ThemeSwitch;
