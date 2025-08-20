import { Anchor, AppShell, Box, Burger, Button, Flex, Group, Menu, Space, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconInfoCircle,
  IconMusic,
  IconMusicPlus,
  IconMusicSearch,
  IconSettings,
  IconSettingsFilled,
  IconUser,
  IconUserSearch,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import About, { Beta } from "./features/about/About";
import Account from "./features/account/Account";
import Confirm from "./features/account/Confirm";
import Artist from "./features/artist/Artist";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import NewSong from "./features/song/NewSong";
import Song from "./features/song/Song";
import { useSongContext } from "./features/song/SongContext";
import { useHeader } from "./hooks/Header";
import { useIsMobile } from "./hooks/isMobile";
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
          <Box m="md" key={index}>
            {item}
          </Box>
        ))}

        {settingsContent.length > 0 && <Menu.Divider />}

        <Box>
          <ThemeSwitch />
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(RoutesEnum.About);
  }, [navigate]);
  return <></>; // Empty component, just for redirect
}

function Router() {
  const { centerContent, defaultCenterContent } = useHeader();

  const navigate = useNavigate();
  const location = useLocation();

  const { songState } = useSongContext();
  const { songId } = songState;

  const artist = useSignal(Signals.artist);

  const tabs: {
    groupText: string;
    tabs: {
      id: string;
      text: string;
      icon?: React.ReactNode;
      link: string;
      hidden?: boolean;
    }[];
  }[] = [
    {
      groupText: "",
      tabs: [
        {
          id: "song",
          text: "Play song",
          icon: <IconMusic />,
          link: RoutesEnum.Songs(songId),
          hidden: !songId,
        },
        {
          id: "editor",
          text: "Create song",
          icon: <IconMusicPlus />,
          link: RoutesEnum.Editor,
        },
        {
          id: "room",
          text: "Room",
          icon: <IconUsersGroup />,
          link: RoutesEnum.Room(),
        },
      ],
    },
    {
      groupText: "",
      tabs: [
        {
          id: "songs",
          text: "Songs",
          icon: <IconMusicSearch />,
          link: RoutesEnum.Songs(),
        },
        {
          id: "artists",
          text: "Artists",
          icon: <IconUserSearch />,
          link: RoutesEnum.Artists(artist?.id),
        },
      ],
    },
    {
      groupText: "",
      tabs: [
        {
          id: "account",
          text: "Account",
          icon: <IconUser />,
          link: RoutesEnum.Account,
        },

        {
          id: "about",
          text: "About",
          icon: <IconInfoCircle />,
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
  // On desktop we show minimized/expanded navbar by default
  const isMobile = useIsMobile();

  const [navbarExpanded, { toggle: toggleNavbar, close: minimizeNavbar }] = useDisclosure(
    localStorage.getItem("navbarExpanded") === "true",
  );

  useEffect(() => {
    // Save changes to local storage
    localStorage.setItem("navbarExpanded", JSON.stringify(navbarExpanded));
  }, [navbarExpanded]);

  useEffect(() => {
    if (isMobile) {
      minimizeNavbar(); // Minimize navbar on mobile
    }
  }, [isMobile]);

  // Set default center content to Beta
  const { setDefaultCenterContent } = useHeader();
  useEffect(() => {
    setDefaultCenterContent(<Beta />);
  }, []);

  const navbarWidth = navbarExpanded ? 280 : 60;
  const transitionDuration = 150;
  const transitionTimingFunction = "ease-in-out";

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !navbarExpanded && isMobile, desktop: false },
      }}
      transitionDuration={transitionDuration}
      transitionTimingFunction={transitionTimingFunction}
      pt={isMobile ? "sm" : "md"}
      pl={isMobile ? "sm" : "xl"}
      pr={isMobile ? "sm" : "xl"}
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <AppShell.Header bg="header-bg">
        <Group justify="space-between" ta={"center"} align="center" style={{ height: "100%" }}>
          {/* Burger on the left */}
          <Group>
            <Burger opened={navbarExpanded} onClick={toggleNavbar} ml="xs" />
          </Group>

          {/* Center content is optional */}
          {(centerContent || defaultCenterContent) && (
            <Group>
              {/* Optional box to move header center when navbar opens */}
              {/* {!isMobile && (
                <Box
                  w={navbarWidth}
                  p={0}
                  m={0}
                  style={{ transitionDuration: String(transitionDuration), transitionTimingFunction }}
                />
              )} */}
              {centerContent || defaultCenterContent}
            </Group>
          )}

          {/* Settings menu on the right with also optional content, except theme switch */}
          <Group>
            <SettingsMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="navbar-bg">
        <Stack gap="md">
          {tabs
            .filter((g) => g.tabs.length)
            .map((group, index) => (
              <Flex pl={0} ml={0} direction={"column"} key={group.groupText || `group-${index}`} gap="lg" m={0} p={0}>
                {index === 0 && <Space h="xs" />}
                {/* {index > 0 && <Space my="xs" />} */}
                {group.groupText && navbarExpanded && (
                  <Text c="dimmed" size="md">
                    {group.groupText}
                  </Text>
                )}
                {group.tabs
                  .filter((t) => !t.hidden)
                  .map(({ id, link, text, icon }) => (
                    <Tooltip key={id} label={text} position="right" disabled={navbarExpanded} withArrow>
                      <Anchor
                        variant="subtle"
                        pl={0}
                        ml={0}
                        id={id}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(link);
                          setTimeout(() => {
                            isMobile && toggleNavbar();
                          }, 150);
                        }}
                        href={link}
                        w={"100%"}
                      >
                        <Button variant={isTabActive(link) ? "light" : "subtle"} p={0} m={0} w={"100%"} c="primary">
                          {navbarExpanded ? (
                            <Group gap="sm" align="center">
                              <Box w={20} c="dimmed">
                                {icon}
                              </Box>
                              <Text size="lg">{text}</Text>
                              <Box w={20}></Box>
                            </Group>
                          ) : (
                            <Box w={24} c="dimmed">
                              {icon}
                            </Box>
                          )}
                        </Button>
                      </Anchor>
                    </Tooltip>
                  ))}
              </Flex>
            ))}
        </Stack>
      </AppShell.Navbar>

      {/* <AppShell.Aside>Aside</AppShell.Aside> */}

      <AppShell.Main id="appshellmain" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Routes>
          <Route index element={<Index />} />
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
