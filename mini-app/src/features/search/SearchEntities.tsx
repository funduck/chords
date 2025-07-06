import { Button, Flex, Space, Text } from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { ReactNode, useContext, useEffect, useRef } from "react";

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

// Generic props interface for the SearchEntities component
interface SearchEntitiesProps<T, SP extends SearchParams> {
  // API and context
  apiContext: React.Context<any>;
  useSearchContext: () => {
    searchState: any;
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
  renderPagination?: (props: PaginationProps) => ReactNode;
  renderResults?: (props: ResultsProps<T>) => ReactNode;
}

interface PaginationProps {
  searchState: any;
  searching: boolean;
  onLoadMore?: () => void;
  searchMoreButtonRef?: React.RefObject<HTMLButtonElement | null>;
  entityName: string;
}

interface ResultsProps<T> {
  searchState: any;
  ListItemComponent: React.ComponentType<any>;
  listItemProps: (entity: T) => any;
}

function SearchEntities<T extends { id?: number; cursor?: string }, SP extends SearchParams>({
  apiContext,
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

  const api = useContext(apiContext);
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
    if ((searchState.searching || searchState.loadingMore) && api) {
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
  }, [searchState.searching, searchState.loadingMore, api]);

  if (!api) {
    return <div>Loading...</div>;
  }

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
                <ListItemComponent key={entity.id} {...listItemProps(entity)} />
              ))}
            </Stack>
          )}

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
            </>
          )}
        </>
      )}
    </>
  );
}

export default SearchEntities;
