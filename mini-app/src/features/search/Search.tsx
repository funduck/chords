import { Tabs } from "@mantine/core";

import SearchArtists from "./SearchArtists";
import SearchEverywhere from "./SearchEverywhere";
import SearchSongs from "./SearchSongs";

function Search() {
  return (
    <>
      <Tabs defaultValue={"all"}>
        <Tabs.List grow justify="center" mb="md">
          <Tabs.Tab value="all">Everywhere</Tabs.Tab>
          <Tabs.Tab value="artist">Artists</Tabs.Tab>
          <Tabs.Tab value="song">Songs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all">
          <SearchEverywhere />
        </Tabs.Panel>

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
