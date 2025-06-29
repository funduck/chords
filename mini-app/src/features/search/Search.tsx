import { Button, Flex, Pagination, Space, TextInput } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { LibraryApiContext, SongInfoEntity } from "@src/hooks/Api";

import Stack from "@components/Stack";
import Section from "@components/section";

import SearchSongListItem from "./SearchSongListItem";

function Search() {
  const libraryApi = useContext(LibraryApiContext);

  const [query, setQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [searching, setSearching] = useState<boolean>(false);
  const [songs, setSongs] = useState<SongInfoEntity[] | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (searching && libraryApi) {
      libraryApi
        .searchPublicLibrary({
          request: {
            query,
            limit: pageSize,
            offset: pageSize * (currentPage - 1) || 0,
            return_rows: true,
            return_total: true, // TODO it is possible to skip counting total
          },
        })
        .then((res) => {
          setSongs(res.songs!);
          setTotalPages(Math.ceil((res.total || 0) / pageSize));
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, query, libraryApi, pageSize, currentPage]);

  if (!libraryApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Flex direction={"column"} gap="md">
          <TextInput
            name="query"
            placeholder="Search by Title or Artist"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button onClick={() => setSearching(true)} disabled={searching} loading={searching}>
            Find
          </Button>
        </Flex>

        <Space h="xl" />

        {!searching && songs && (
          <>
            <Stack>
              {songs.map((song) => (
                <SearchSongListItem key={song.id} song={song} />
              ))}
            </Stack>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={(page) => {
                setCurrentPage(page);
                setSearching(true);
              }}
              mt="sm"
            />
          </>
        )}
      </Section>
    </>
  );
}

export default Search;
