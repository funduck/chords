import { useEffect } from "react";

import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import SearchSongs from "./SearchSongs";

function Search() {
  useScrollPosition();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent();
  }, []);

  return <SearchSongs />;
}

export default Search;
