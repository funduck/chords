import { Anchor, AppShell, Burger, Button, Group, Menu, em } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router";

import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import Title from "./components/Title";
import Artist from "./features/artist/Artist";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import Song from "./features/song/Song";
import { useHeader } from "./hooks/Header";
import { Signals } from "./services/signals-registry";

class RoutesEnum {
  static Search = function (tab?: string): string {
    if (tab == null) {
      return "/search";
    }
    return "/search/" + tab;
  };
  static Artist = function (artistId?: number): string {
    if (artistId == null) {
      return "/artist";
    }
    return "/artist/" + artistId;
  };
  static Room = "/room";
  static Song = function (songId?: number): string {
    if (songId == null) {
      return "/song";
    }
    return "/song/" + songId;
  };
}

export { RoutesEnum };

function SettingsMenu() {
  const { settingsContent } = useHeader();
  const [opened, { toggle }] = useDisclosure();
  return (
    <Menu shadow="md" withArrow onChange={toggle} closeOnItemClick={false}>
      <Menu.Target>
        <Button variant="subtle">
          {opened ? (
            <IconSettingsFilled color="var(--mantine-color-text)" />
          ) : (
            <IconSettings color="var(--mantine-color-text)" />
          )}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Here we inject custom menu items */}
        {settingsContent.map((item, index) => (
          <Menu.Item key={index}>{item}</Menu.Item>
        ))}

        {/* Theme switch is always in menu */}
        <Menu.Divider />
        <Menu.Item>
          <ThemeSwitch />
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function Router() {
  const { centerContent } = useHeader();

  const navigate = useNavigate();

  const searchTab = useSignal(Signals.searchTab);
  const songId = useSignal(Signals.publishSongId);
  const artist = useSignal(Signals.artist);

  const tabs = [
    {
      id: "search",
      text: "Search",
      link: RoutesEnum.Search(searchTab || undefined),
    },
    {
      id: "artist",
      text: "Artist",
      link: RoutesEnum.Artist(artist?.id),
    },
    {
      id: "room",
      text: "Room",
      link: RoutesEnum.Room,
    },
    {
      id: "song",
      text: "Song",
      link: RoutesEnum.Song(songId || undefined),
    },
  ];

  // On mobile we close the navbar when navigating
  // On desktop we open the navbar by default
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

  const [navbarOpened, { toggle: toggleNavbar, open: openNavbar, close: closeNavbar }] = useDisclosure();

  useEffect(() => {
    if (isMobile) {
      closeNavbar(); // Close navbar on mobile
    } else {
      openNavbar(); // Open navbar on desktop
    }
  }, [isMobile]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !navbarOpened, desktop: !navbarOpened } }}
      transitionDuration={150}
      padding="md"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <AppShell.Header>
        <Group justify="space-between" m="sm">
          {/* Burger on the left */}
          <Group gap="sm">
            <Burger opened={navbarOpened} onClick={toggleNavbar} />
          </Group>

          {/* Center content is optional */}
          {centerContent && <Group gap="sm">{centerContent}</Group>}

          {/* Settings menu on the right with also optional content, except theme switch */}
          <Group gap="sm">
            <SettingsMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="lg">
        <Stack gap="lg">
          {tabs.map(({ id, link, text }) => (
            <Button variant="subtle" justify="start">
              <Anchor
                key={id}
                id={id}
                onClick={() => {
                  isMobile && toggleNavbar();
                  navigate(link);
                }}
              >
                <Title>{text}</Title>
              </Anchor>
            </Button>
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* <AppShell.Aside>Aside</AppShell.Aside> */}

      <AppShell.Main id="appshellmain" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Routes>
          <Route index element={<Search />} />
          <Route path="search" element={<Search />} />
          <Route path="search/:searchTab" element={<Search />} />
          <Route path="room" element={<Room />} />
          <Route path="artist" element={<Artist />} />
          <Route path="artist/:artistId" element={<Artist />} />
          <Route path="song" element={<Song />} />
          <Route path="song/:songId" element={<Song />} />
        </Routes>
      </AppShell.Main>

      {/* <AppShell.Footer></AppShell.Footer> */}
    </AppShell>
  );
}
export default Router;
