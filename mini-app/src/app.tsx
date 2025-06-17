import { useSignal } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";

import Image from "@components/image";
import Tabbar from "@components/tabbar";

import TabLink from "./components/tab-link";
import AnonymousLogin from "./features/connection/anonymous-login";
import { EventsConsumer, EventsPublisher } from "./features/connection/events";
import { RoutesEnum } from "./routes";
import { Signals } from "./signals-registry";

function App() {
  const navigate = useNavigate();

  const currentTab = useSignal(Signals.selectedTabId);

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
    // {
    //   id: "settings",
    //   text: "Settings",
    //   Icon: () => <div>⚙️</div>,
    //   link: RoutesEnum.Settings,
    // },
    // {
    //   id: "about",
    //   text: "About",
    //   Icon: () => <div>ℹ️</div>,
    //   link: RoutesEnum.About,
    // },
  ];

  return (
    <>
      <EventsPublisher />
      <EventsConsumer />
      <AnonymousLogin />
      <Tabbar>
        {tabs.map(({ id, Icon, link }) => (
          <Tabbar.Item
            key={id}
            selected={id === currentTab}
            onClick={() => {
              navigate(link);
            }}
          >
            <TabLink to={link} id={id}>
              <Icon />
            </TabLink>
          </Tabbar.Item>
        ))}
      </Tabbar>
    </>
  );
}

export default App;
