import { Box, Group, Switch, Text, Title } from "@mantine/core";
import { IconUserSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useArtistsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import PublicSearchDisclaimer from "./PublicSearchDisclaimer";
import SearchArtistListItem from "./SearchArtistListItem";
import { useSearchArtistsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";

function SearchArtists() {
  const artistsApi = useArtistsApi();

  // Initialize scroll position management
  useScrollPosition();

  const { updateSearchState } = useSearchArtistsContext();

  useEffect(() => {
    // Reset search state when component mounts
    updateSearchState({
      cursorAfter: undefined,
      cursorBefore: undefined,
      loadingMore: false,
      searching: true,
      query: "",
    });
  }, [artistsApi]);

  const [inPrivateLibs, setInPrivateLibs] = useState(() => {
    const saved = localStorage.getItem("search-artists-preferences-inPrivateLibs");
    return saved !== null ? JSON.parse(saved) : true;
  });

  if (!artistsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Box ta="center" mb="lg">
        <Title order={2} c="primary">
          <IconUserSearch size={22} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> Search Artists
        </Title>
        <Text c="dimmed" size="sm">
          Find artists quickly. Toggle to search your library or public catalog.
        </Text>
      </Box>

      <SearchEntities
        useSearchContext={useSearchArtistsContext}
        searchMethod={(params) =>
          artistsApi!.searchArtists({
            request: { ...params.request, library_type: inPrivateLibs ? "private" : undefined },
          })
        }
        ListItemComponent={SearchArtistListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Artist by Name"
        entityName="artists"
        beforeQueryInput={
          <Group>
            <Switch
              ml="sm"
              label="In my library"
              checked={inPrivateLibs}
              onChange={(e) => {
                const newValue = e.currentTarget.checked;
                setInPrivateLibs(newValue);
                localStorage.setItem("search-artists-preferences-inPrivateLibs", JSON.stringify(newValue));
              }}
            />

            {!inPrivateLibs && <PublicSearchDisclaimer />}
          </Group>
        }
      />
    </>
  );
}

export default SearchArtists;
