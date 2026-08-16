import { Box, Group, Select } from "@mantine/core";
import { useEffect, useState } from "react";

import PageTop from "@src/components/PageTop";
import { useAccountContext } from "@src/features/account/AccountContext";
import { useArtistsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import PublicSearchDisclaimer from "./PublicSearchDisclaimer";
import SearchArtistListItem from "./SearchArtistListItem";
import { useSearchArtistsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import { deriveLibraryFilter, useLibraryOptions } from "./libraryFilter";

const LIBRARY_PREF_KEY = "search-artists-preferences-library";

function SearchArtists() {
  const artistsApi = useArtistsApi();
  const { collections } = useAccountContext();

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

  const [librarySel, setLibrarySel] = useState<string>(
    () => localStorage.getItem(LIBRARY_PREF_KEY) || "my",
  );

  const libraryOptions = useLibraryOptions(collections);
  // Fall back to "my" if the selected shared collection was revoked.
  const effectiveSel =
    collections === null || libraryOptions.some((o) => o.value === librarySel) ? librarySel : "my";
  const { libraryType, ownerId } = deriveLibraryFilter(effectiveSel);

  if (!artistsApi) {
    return <div>Loading...</div>;
  }

  return (
    <Box mt="xl">
      <PageTop title="Search Artists" />

      <SearchEntities
        useSearchContext={useSearchArtistsContext}
        searchMethod={(params) =>
          artistsApi!.searchArtists({
            request: { ...params.request, library_type: libraryType, owner_id: ownerId },
          })
        }
        ListItemComponent={SearchArtistListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Artist by Name"
        entityName="artists"
        afterQueryInput={
          <Group ml="sm" align="flex-end" gap="sm">
            <Select
              data={libraryOptions}
              value={effectiveSel}
              onChange={(value) => {
                const newValue = value || "my";
                setLibrarySel(newValue);
                localStorage.setItem(LIBRARY_PREF_KEY, newValue);
              }}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
              w={220}
            />

            {effectiveSel === "public" && <PublicSearchDisclaimer />}
          </Group>
        }
      />
    </Box>
  );
}

export default SearchArtists;
