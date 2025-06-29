import { ReactNode, createContext, useContext, useState } from "react";

import { SongInfoEntity } from "@src/hooks/Api";

interface SearchState {
  query: string;
  pageSize: number;
  songs: SongInfoEntity[] | null;
  totalPages: number;
  currentPage: number;
  hasSearched: boolean;
}

interface SearchContextType {
  searchState: SearchState;
  updateSearchState: (updates: Partial<SearchState>) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const initialState: SearchState = {
  query: "",
  pageSize: 10,
  songs: null,
  totalPages: 0,
  currentPage: 1,
  hasSearched: false,
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>(initialState);

  const updateSearchState = (updates: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  };

  const clearSearch = () => {
    setSearchState(initialState);
  };

  return (
    <SearchContext.Provider value={{ searchState, updateSearchState, clearSearch }}>{children}</SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
}
