import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { getSongArtist } from "@src/utils/song";

import { useSongContext } from "./SongContext";

interface NewSongFormProps {
  sheetValue: string;
}

function NewSongForm({ sheetValue }: NewSongFormProps) {
  const { createSong } = useSongContext();

  const newSongForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      artist: "",
    },

    validate: {
      title: (value) => (value.length < 3 ? "Title must be at least 3 characters long" : null),
      artist: (value) => (value.length < 3 ? "Artist name must be at least 3 characters long" : null),
    },
  });

  const [opened, { open, close }] = useDisclosure(false);

  // Parse some values from the sheet when the modal opens
  useEffect(() => {
    if (!sheetValue || !opened) return;

    const song = ChordProService.sheetToSong(sheetValue, {});
    if (!song) return;

    newSongForm.setValues({
      title: song.title || "",
      artist: (getSongArtist(song) || []).join(", "),
    });
  }, [sheetValue, opened]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create New Song">
        <form
          onSubmit={newSongForm.onSubmit((values) => {
            let sheetToSave = sheetValue;

            const song = ChordProService.sheetToSong(sheetValue, {});
            if (song) {
              sheetToSave = ChordProService.songToSheet(song);
              if (!song.title) {
                sheetToSave = `{title: ${values.title}}\n${sheetToSave}`;
              }
              if (!song.artist || song.artist.length === 0) {
                sheetToSave = `{artist: ${values.artist}}\n${sheetToSave}`;
              }
            } else {
              notifications.show({
                title: "Error",
                message: "Failed to parse sheet as ChordPro, please check the format.",
                color: "red",
                position: "top-right",
                autoClose: false,
              });
              return;
            }

            createSong({
              song: {
                format: "chordpro",
                title: values.title,
                artists: [values.artist],
                sheet: sheetToSave,
              },
            });
            close();
          })}
        >
          <TextInput
            withAsterisk
            label="Title"
            placeholder="Your Song Title"
            key={newSongForm.key("title")}
            {...newSongForm.getInputProps("title")}
          />
          <TextInput
            withAsterisk
            label="Artist"
            placeholder="Maybe you? ;)"
            key={newSongForm.key("artist")}
            {...newSongForm.getInputProps("artist")}
          />

          <Group justify="flex-start" mt="md">
            <Button type="submit">Create</Button>
          </Group>
        </form>
      </Modal>
      <Button variant="outline" onClick={open}>
        Save
      </Button>
    </>
  );
}

export default NewSongForm;
