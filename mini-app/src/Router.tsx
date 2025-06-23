import { Anchor, AppShell, Burger, Button, Drawer, Group, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSignal } from "@telegram-apps/sdk-react";
import { Route, Routes, useNavigate } from "react-router";

import Image from "@src/components/Image";

import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import Title from "./components/Title";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import Song from "./features/song/Song";
import { Signals } from "./services/signals-registry";

class RoutesEnum {
  static Search = "/";
  static Room = "/room";
  static Song = function (songId?: string): string {
    if (songId == null) {
      return "/song";
    }
    return "/song/" + songId;
  };
}

export { RoutesEnum };

function Router() {
  const navigate = useNavigate();

  const pageTitle = useSignal(Signals.pageTitle);

  const tabs = [
    {
      id: "search",
      text: "Search",
      Icon: () => (
        <Image style={{ background: "white", borderRadius: "50%" }} src="/src/assets/search.svg" alt="Search Icon" />
      ),
      link: RoutesEnum.Search,
    },
    {
      id: "room",
      text: "Room",
      Icon: () => (
        <Image style={{ background: "white", borderRadius: "20%" }} src="/src/assets/room.png" alt="Room Icon" />
      ),
      link: RoutesEnum.Room,
    },
    {
      id: "song",
      text: "Song",
      Icon: () => <Image style={{ borderRadius: "50%" }} src="/src/assets/song.jpg" alt="Song Icon" />,
      link: RoutesEnum.Song(),
    },
  ];

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="normal" m="sm">
          {/* <Burger opened={opened} onClick={open} aria-label="Toggle navigation" /> */}
          <Burger hiddenFrom="sm" opened={mobileOpened} onClick={toggleMobile} />
          <Title>{pageTitle}</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="lg">
        <Stack gap="lg">
          {tabs.map(({ id, link, text }) => (
            <Anchor
              key={id}
              id={id}
              onClick={() => {
                Signals.pageTitle.set(text);
                navigate(link);
                close();
              }}
            >
              <Title>{text}</Title>
            </Anchor>
          ))}
        </Stack>
        <Space h="xl" />
        <ThemeSwitch />
      </AppShell.Navbar>
      {/* <AppShell.Aside>Aside</AppShell.Aside> */}
      <AppShell.Footer></AppShell.Footer>
      <AppShell.Main>
        <Routes>
          <Route index element={<Search />} />
          <Route path="room" element={<Room />} />
          <Route path="song" element={<Song />} />
          <Route path="song/:songId" element={<Song />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
export default Router;
