import { Anchor, AppShell, Burger, Group, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Route, Routes, useNavigate } from "react-router";

import Image from "@components/Image";
import Stack from "@components/Stack";

import ThemeSwitch from "./components/ThemeSwitch";
import Title from "./components/Title";
import Room from "./features/room/Room";
import Search from "./features/search/Search";
import Song from "./features/song/Song";

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

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !mobileOpened, desktop: false } }}
      padding="md"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <AppShell.Header>
        <Group justify="normal" m="sm">
          <Burger hiddenFrom="sm" opened={mobileOpened} onClick={toggleMobile} />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="lg">
        <Stack gap="lg">
          {tabs.map(({ id, link, text }) => (
            <Anchor
              key={id}
              id={id}
              onClick={() => {
                toggleMobile();
                navigate(link);
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
      <AppShell.Main id="appshelmain" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
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
