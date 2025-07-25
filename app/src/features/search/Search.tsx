import { useEffect } from "react";

import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import SearchSongs from "./SearchSongs";

function Search() {
  // Initialize scroll position management
  useScrollPosition();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent("Songs");
  }, []);

  return <SearchSongs />;
}

export default Search;
