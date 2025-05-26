import { useSignal } from "@telegram-apps/sdk-react";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { Signals } from "./signals-registry";
import TabLink from "./components/tab-link";
import { RoutesEnum } from "./routes";
import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();

  const songId = useSignal(Signals.selectedSongId);
  const currentTab = useSignal(Signals.selectedTabId);

  const tabs = [
    {
      id: "search",
      text: "Search",
      Icon: () => <div>🔍</div>,
      link: RoutesEnum.Search,
    },
    {
      id: "song",
      text: "Song",
      Icon: () => <div>🎵</div>,
      link: RoutesEnum.Song(songId),
    },
    {
      id: "settings",
      text: "Settings",
      Icon: () => <div>⚙️</div>,
      link: RoutesEnum.Settings,
    },
    // {
    //   id: "about",
    //   text: "About",
    //   Icon: () => <div>ℹ️</div>,
    //   link: RoutesEnum.About,
    // },
  ];

  return (
    <>
      <Tabbar>
        {tabs.map(({ id, Icon, link }) => (
          <Tabbar.Item
            key={id}
            // text={text}
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
