import { Anchor, AppShell, Burger, Button, Divider, Flex, Group, Menu, Space, Text, em } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconChevronRight, IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import About from "./features/about/About";
import Account from "./features/account/Account";
import Confirm from "./features/account/Confirm";
import Artist from "./features/artist/Artist";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import NewSong from "./features/song/NewSong";
import Song from "./features/song/Song";
import { useSongContext } from "./features/song/SongContext";
import { useHeader } from "./hooks/Header";
import { Signals } from "./services/signals-registry";

class RoutesEnum {
  static Room = function (roomCode?: string) {
    if (!roomCode) return "/room";
    return "/room/join/" + roomCode;
  };
  static Artists = function (artistId?: number): string {
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
  static Account = "/account";
  static Confirm = function (code: string): string {
    return "/confirm/" + code;
  };
  static About = "/about";
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
        <Menu.Item component="div" key="theme-switch">
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
      group: "",
      tabs: [
        {
          id: "song",
          text: "Play song",
          link: RoutesEnum.Songs(songId),
          hidden: !songId,
        },
        {
          id: "editor",
          text: "New song editor",
          link: RoutesEnum.Editor,
        },
        {
          id: "room",
          text: "Room",
          link: RoutesEnum.Room(),
        },
      ],
    },
    {
      group: "",
      tabs: [
        {
          id: "songs",
          text: "Songs",
          link: RoutesEnum.Songs(),
        },
        {
          id: "artists",
          text: "Artists",
          link: RoutesEnum.Artists(artist?.id),
        },
      ],
    },
    {
      group: "",
      tabs: [
        {
          id: "account",
          text: "Account",
          link: RoutesEnum.Account,
        },

        {
          id: "about",
          text: "About",
          link: RoutesEnum.About,
        },
      ],
    },
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

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !navbarOpened, desktop: !navbarOpened } }}
      transitionDuration={150}
      transitionTimingFunction="ease-in-out"
      padding="md"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <AppShell.Header>
        <Group justify="space-between" ta={"center"} align="center" style={{ height: "100%" }}>
          {/* Burger on the left */}
          <Group>
            <Burger opened={navbarOpened} onClick={toggleNavbar} ml="xs" />
          </Group>

          {/* Center content is optional */}
          {centerContent && <Group>{centerContent}</Group>}

          {/* Settings menu on the right with also optional content, except theme switch */}
          <Group>
            <SettingsMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="lg">
        <Stack gap="lg">
          {tabs
            .filter((g) => g.tabs.length)
            .map((group, index) => (
              <Flex direction={"column"} key={group.group} gap={"lg"} m={0} p={0}>
                {index === 0 && <Space h="xs" />}
                {index > 0 && <Divider my="xl" />}
                {group.group && (
                  <Text c="dimmed" size="md">
                    {group.group}
                  </Text>
                )}
                {group.tabs
                  .filter((t) => !t.hidden)
                  .map(({ id, link, text }) => (
                    <Anchor
                      variant="subtle"
                      key={id}
                      id={id}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link);
                        setTimeout(() => {
                          isMobile && toggleNavbar();
                        }, 150);
                      }}
                      href={link}
                    >
                      <Button variant="subtle" justify="start" w={"100%"}>
                        <Flex align="stretch">
                          {isTabActive(link) ? <IconChevronRight /> : <IconChevronRight color="grba(0,0,0,0)" />}
                          <Text size="lg">{text}</Text>
                        </Flex>
                      </Button>
                    </Anchor>
                  ))}
              </Flex>
            ))}
        </Stack>
      </AppShell.Navbar>

      {/* <AppShell.Aside>Aside</AppShell.Aside> */}

      <AppShell.Main id="appshellmain" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Routes>
          <Route index element={<Search />} />
          <Route path="account" element={<Account />} />
          <Route path="artists/:artistId" element={<Artist />} />
          <Route path="confirm/:code" element={<Confirm />} />
          <Route path="editor" element={<NewSong />} />
          <Route path="room" element={<Room />} />
          <Route path="room/join/:roomCode" element={<Room />} />
          <Route path="search/artists" element={<Artist />} />
          <Route path="search/songs" element={<Search />} />
          <Route path="songs/:songId" element={<Song />} />
          <Route path="about" element={<About />} />
        </Routes>
      </AppShell.Main>

      {/* <AppShell.Footer></AppShell.Footer> */}
    </AppShell>
  );
}
export default Router;
