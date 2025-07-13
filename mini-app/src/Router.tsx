import { Anchor, AppShell, Burger, Button, Flex, Group, Menu, Space, Text, em } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import Artist from "./features/artist/Artist";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import NewSong from "./features/song/NewSong";
import Song from "./features/song/Song";
import { useSongContext } from "./features/song/SongContext";
import { useHeader } from "./hooks/Header";
import { Signals } from "./services/signals-registry";

class RoutesEnum {
  static Room = "/room";
  static SearchArtists = function (artistId?: number): string {
    if (artistId == null) {
      return "/search/artists";
    }
    return "/artists/" + artistId;
  };
  static Songs = function (songId?: number): string {
    if (songId == null) {
      return "/search/songs";
    }
    return "/songs/" + songId;
  };
  static Editor = "/editor";
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
          <Menu.Item component="div" key={index}>
            {item}
          </Menu.Item>
        ))}

        {settingsContent.length > 0 && <Menu.Divider />}
        {/* Theme switch is always in menu */}
        <Menu.Item component="div">
          <Flex align={"center"} ta={"center"} justify={"center"}>
            <ThemeSwitch />
          </Flex>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function Router() {
  const { centerContent } = useHeader();

  const navigate = useNavigate();
  const location = useLocation();

  const { songState } = useSongContext();
  const { songId } = songState;

  const artist = useSignal(Signals.artist);

  const tabs = [
    {
      group: "Current",
      tabs: [
        {
          id: "song",
          text: "Play song",
          link: songId ? RoutesEnum.Songs(songId) : RoutesEnum.Editor,
          // hidden: !song,
          hidden: false,
        },
        {
          id: "editor",
          text: "Editor",
          link: RoutesEnum.Editor,
        },
        {
          id: "room",
          text: "Room",
          link: RoutesEnum.Room,
        },
      ],
    },
    {
      group: "Search",
      tabs: [
        {
          id: "songs",
          text: "Songs",
          link: RoutesEnum.Songs(),
        },
        {
          id: "artists",
          text: "Artists",
          link: RoutesEnum.SearchArtists(artist?.id),
        },
      ],
    },
    { group: "my", tabs: [] },
  ];

  // Function to check if a tab is active
  const isTabActive = (link: string) => {
    const currentPath = location.pathname;
    return currentPath === link || (link.endsWith("/") && currentPath.startsWith(link));
  };

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

  const userId = useSignal(Signals.userId);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !navbarOpened, desktop: !navbarOpened } }}
      transitionDuration={150}
      padding="md"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <AppShell.Header>
        <Group justify="space-between" ta={"center"} align="center" style={{ height: "100%" }}>
          {/* Burger on the left */}
          <Group gap="sm">
            <Burger opened={navbarOpened} onClick={toggleNavbar} ml="xs" />
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
          {tabs
            .filter((g) => g.tabs.length)
            .map((group) => (
              <>
                <Text>{group.group}</Text>
                {group.tabs
                  .filter((t) => !t.hidden)
                  .map(({ id, link, text }) => (
                    <Button
                      variant="subtle"
                      justify="start"
                      key={id}
                      id={id}
                      onClick={() => {
                        isMobile && toggleNavbar();
                        navigate(link);
                      }}
                    >
                      <Anchor>
                        <Text size="xl" fw={isTabActive(link) ? 600 : 500}>
                          {text}
                        </Text>
                      </Anchor>
                    </Button>
                  ))}
              </>
            ))}
        </Stack>
        <Space h="md" />
        <Text c="dimmed" size="xs">
          {userId}
        </Text>
      </AppShell.Navbar>

      {/* <AppShell.Aside>Aside</AppShell.Aside> */}

      <AppShell.Main id="appshellmain" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Routes>
          <Route index element={<Search />} />
          <Route path="search/songs" element={<Search />} />
          <Route path="songs/:songId" element={<Song />} />
          <Route path="editor" element={<NewSong />} />
          <Route path="room" element={<Room />} />
          <Route path="search/artists" element={<Artist />} />
          <Route path="artists/:artistId" element={<Artist />} />
        </Routes>
      </AppShell.Main>

      {/* <AppShell.Footer></AppShell.Footer> */}
    </AppShell>
  );
}
export default Router;
