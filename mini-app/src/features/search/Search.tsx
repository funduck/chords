import { Tabs } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";

import SearchArtists from "./SearchArtists";
import SearchSongs from "./SearchSongs";

function Search() {
  // Initialize scroll position management
  useScrollPosition();

  const navigate = useNavigate();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent("Search");
  }, []);

  const activeTab = useSignal(Signals.searchTab);
  const { searchTab } = useParams<{ searchTab?: string }>();

  useEffect(() => {
    if (searchTab) {
      Signals.searchTab.set(searchTab);
    }
  }, [searchTab]);

  return (
    <>
      <Tabs
        value={activeTab || "song"}
        defaultValue={"song"}
        onChange={(value) => {
          Signals.searchTab.set(value);
          navigate(RoutesEnum.Search(value || undefined));
        }}
      >
        <Tabs.List grow justify="center" mb="md">
          <Tabs.Tab value="song">Songs</Tabs.Tab>
          <Tabs.Tab value="artist">Artists</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="artist">
          <SearchArtists />
        </Tabs.Panel>

        <Tabs.Panel value="song">
          <SearchSongs />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default Search;
