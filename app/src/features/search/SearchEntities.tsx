import { Button, Divider, Flex, Space, Text } from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { ReactNode, useEffect } from "react";

import QueryInput from "@components/QueryInput";
import Stack from "@components/Stack";

type SearchParams = {
  query: string;
  limit: number;
  cursor_after?: string;
  cursor_before?: string;
  return_rows?: boolean;
  return_total?: boolean;
};

type SearchMethodParams<SP extends SearchParams> = {
  request: SP;
};

interface SearchState<T> {
  query: string;
  entities: T[] | null;
  total?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  cursorAfter?: string;
  cursorBefore?: string;
  searching?: boolean;
  loadingMore?: boolean;
  pageSize: number;
}

// Generic props interface for the SearchEntities component
interface SearchEntitiesProps<T, SP extends SearchParams> {
  // API and context
  useSearchContext: () => {
    searchState: SearchState<T>;
    updateSearchState: (updates: any) => void;
  };

  // Search functionality
  searchMethod: (params: SearchMethodParams<SP>) => Promise<{ entities?: T[]; total?: number }>;

  // UI components
  ListItemComponent: React.ComponentType<any>;
  listItemProps: (entity: T) => any;

  // Configuration
  placeholder: string;
  entityName: string; // "artists" or "songs"

  // Optional customizations
  renderPagination?: (props: PaginationProps<T>) => ReactNode;
  renderResults?: (props: ResultsProps<T>) => ReactNode;
}

interface PaginationProps<T> {
  searchState: SearchState<T>;
  searching: boolean;
  onLoadMore?: () => void;
  searchMoreButtonRef?: React.RefObject<HTMLButtonElement | null>;
  entityName: string;
}

interface ResultsProps<T> {
  searchState: SearchState<T>;
  ListItemComponent: React.ComponentType<any>;
  listItemProps: (entity: T) => any;
}

function SearchEntities<T extends { id?: number; cursor?: string }, SP extends SearchParams>({
  useSearchContext,
  searchMethod,
  ListItemComponent,
  listItemProps,
  placeholder,
  entityName,
  renderPagination,
  renderResults,
}: SearchEntitiesProps<T, SP>) {
  const { scrollIntoView: scrollMoreButtonIntoView, targetRef: searchMoreButtonRef } =
    useScrollIntoView<HTMLButtonElement>({
      offset: 60,
    });

  const { searchState, updateSearchState } = useSearchContext();

  const handleSearch = () => {
    // Save to history using the QueryInput's method
    if ((QueryInput as any).saveToHistory) {
      (QueryInput as any).saveToHistory(searchState.query);
    }

    // Clear cursors and entities for fresh search (infinite scroll)
    updateSearchState({
      cursorAfter: undefined,
      cursorBefore: undefined,
      entities: null, // Clear existing results
      searching: true,
      loadingMore: false,
    });
  };

  const handleLoadMore = () => {
    if (
      searchState.entities &&
      searchState.entities.length > 0 &&
      searchState.hasNextPage &&
      !searchState.loadingMore
    ) {
      const lastEntity = searchState.entities[searchState.entities.length - 1];
      updateSearchState({
        cursorAfter: lastEntity.cursor,
        cursorBefore: undefined,
        loadingMore: true,
      });
    }
  };

  // Perform search when searching state changes and api is available
  useEffect(() => {
    if (searchState.searching || searchState.loadingMore) {
      const isInitialSearch = searchState.searching && !searchState.loadingMore;

      const searchParams: { request: SP } = {
        request: {
          query: searchState.query,
          limit: searchState.pageSize,
          cursor_after: searchState.cursorAfter,
          cursor_before: searchState.cursorBefore,
          return_rows: true,
          return_total: isInitialSearch, // Only fetch total for initial searches
        } as SP,
      };

      searchMethod(searchParams)
        .then((res) => {
          const newEntities = res.entities || [];
          const total = res.total || searchState.total || 0;

          // For initial search, replace entities. For loading more, append to existing entities
          const entities = isInitialSearch ? newEntities : [...(searchState.entities || []), ...newEntities];

          // Determine pagination state
          const hasNextPage = newEntities.length === searchState.pageSize;
          const hasPreviousPage = false; // Not needed for infinite scroll

          updateSearchState({
            entities,
            total,
            hasNextPage,
            hasPreviousPage,
            searching: false,
            loadingMore: false,
          });

          scrollMoreButtonIntoView();
        })
        .catch(console.error)
        .finally(() => {
          updateSearchState({
            searching: false,
            loadingMore: false,
          });
        });
    }
  }, [searchState.searching, searchState.loadingMore]);

  return (
    <>
      <Flex direction={"column"} gap="md">
        <QueryInput
          name={"search-query-input"}
          query={searchState.query}
          onQueryChange={(query) => updateSearchState({ query })}
          onSubmit={handleSearch}
          placeholder={placeholder}
        />

        <Button
          variant="outline"
          onClick={handleSearch}
          disabled={searchState.searching}
          loading={searchState.searching}
        >
          Find
        </Button>
      </Flex>

      <Space h="xl" />

      {searchState.entities && (
        <>
          {renderResults ? (
            renderResults({
              searchState,
              ListItemComponent,
              listItemProps,
            })
          ) : (
            <Stack>
              {searchState.entities.map((entity: T) => (
                <>
                  <ListItemComponent key={entity.id} {...listItemProps(entity)} />
                  <Divider />
                </>
              ))}

              {renderPagination ? (
                renderPagination({
                  searchState,
                  searching: false,
                  onLoadMore: handleLoadMore,
                  searchMoreButtonRef,
                  entityName,
                })
              ) : (
                // Default infinite scroll pagination
                <>
                  {searchState.total && searchState.hasNextPage && (
                    <Button
                      w="100%"
                      ref={searchMoreButtonRef as React.RefObject<HTMLButtonElement>}
                      onClick={handleLoadMore}
                      variant="outline"
                      mt="md"
                      ta={"center"}
                      c="dimmed"
                    >
                      Showing {searchState.entities.length} of {searchState.total} {entityName}
                    </Button>
                  )}
                  {searchState.total && !searchState.hasNextPage && (
                    <Text size="sm" c="dimmed" ta="center" mt="md">
                      All {searchState.total} {entityName} loaded
                    </Text>
                  )}
                  <Space h="xl" />
                </>
              )}
            </Stack>
          )}
        </>
      )}
    </>
  );
}

export default SearchEntities;
