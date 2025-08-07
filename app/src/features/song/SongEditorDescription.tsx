import { Anchor, Group, Text } from "@mantine/core";
import { IconEdit, IconEye } from "@tabler/icons-react";

export default function SongEditorDescription() {
  return (
    <>
      <Text c="dimmed" mb="md" ml="md">
        Song editor allows you to create and edit chord sheets using{" "}
        <Anchor href="https://www.chordpro.org/chordpro/chordpro-introduction/">ChordPro</Anchor> format.
        <Group gap="xs">
          <IconEdit />
          <Text>
            You can paste sheet from other sources and format it to ChordPro. It may require some manual adjustments
            though.
          </Text>
        </Group>
        <Group gap="xs">
          <IconEye />
          <Text>Use the preview mode to see how your song will look when displayed.</Text>
        </Group>
      </Text>
    </>
  );
}
