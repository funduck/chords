import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

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

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create New Song">
        <form
          onSubmit={newSongForm.onSubmit((values) => {
            createSong({
              song: {
                format: "chordpro",
                title: values.title,
                artists: [values.artist],
                sheet: sheetValue,
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
            placeholder="Artist... Maybe it is you? ;)"
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
