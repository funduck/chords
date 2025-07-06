import { ReactNode, createContext, useContext, useState } from "react";

import { SearchPageSize } from "@src/config";
import { ArtistInfoEntity, SongInfoEntity } from "@src/hooks/Api";

interface SearchState<T> {
  query: string;
  pageSize: number;
  entities: T[] | null;
  cursorAfter?: string | undefined; // For pagination, if needed
  cursorBefore?: string | undefined; // For pagination, if needed
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total?: number; // Total count for display purposes
  searching?: boolean; // Indicates if a search is in progress
  loadingMore?: boolean; // Indicates if more results are being loaded
}

interface SearchContextType<T> {
  searchState: SearchState<T>;
  updateSearchState: (updates: Partial<SearchState<T>>) => void;
  clearSearch: () => void;
}

const SearchSongsContext = createContext<SearchContextType<SongInfoEntity> | undefined>(undefined);
const SearchArtistsContext = createContext<SearchContextType<ArtistInfoEntity> | undefined>(undefined);

const initialStateSongs: SearchState<SongInfoEntity> = {
  query: "",
  pageSize: SearchPageSize,
  entities: null,
  hasNextPage: false,
  hasPreviousPage: false,
};
const initialStateArtists: SearchState<ArtistInfoEntity> = {
  query: "",
  pageSize: SearchPageSize,
  entities: null,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchSongsState, setSearchSongsState] = useState<SearchState<SongInfoEntity>>(initialStateSongs);
  const [searchArtistsState, setSearchArtistsState] = useState<SearchState<ArtistInfoEntity>>(initialStateArtists);

  const updateSearchSongsState = (updates: Partial<SearchState<SongInfoEntity>>) => {
    setSearchSongsState((prev) => ({ ...prev, ...updates }));
  };
  const updateSearchArtistsState = (updates: Partial<SearchState<ArtistInfoEntity>>) => {
    setSearchArtistsState((prev) => ({ ...prev, ...updates }));
  };

  const clearSearchSongs = () => {
    setSearchSongsState(initialStateSongs);
  };
  const clearSearchArtists = () => {
    setSearchArtistsState(initialStateArtists);
  };

  return (
    <SearchArtistsContext.Provider
      value={{
        searchState: searchArtistsState,
        updateSearchState: updateSearchArtistsState,
        clearSearch: clearSearchArtists,
      }}
    >
      <SearchSongsContext.Provider
        value={{
          searchState: searchSongsState,
          updateSearchState: updateSearchSongsState,
          clearSearch: clearSearchSongs,
        }}
      >
        {children}
      </SearchSongsContext.Provider>
    </SearchArtistsContext.Provider>
  );
}

export function useSearchSongsContext() {
  const context = useContext(SearchSongsContext);
  if (!context) {
    throw new Error("useSearchSongsContext must be used within SearchProvider");
  }
  return context;
}

export function useSearchArtistsContext() {
  const context = useContext(SearchArtistsContext);
  if (!context) {
    throw new Error("useSearchArtistsContext must be used within SearchProvider");
  }
  return context;
}
