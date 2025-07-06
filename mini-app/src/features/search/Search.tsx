import { Tabs } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";

import { Signals } from "@src/services/signals-registry";

import SearchArtists from "./SearchArtists";
import SearchSongs from "./SearchSongs";

function Search() {
  const activeTab = useSignal(Signals.searchTab);

  return (
    <>
      <Tabs value={activeTab} onChange={(value) => Signals.searchTab.set(value)}>
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
