import { Button, Card, Flex, Text, useMantineColorScheme } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Chord from "@techies23/react-chords";
import { useState } from "react";

import { ChordsService } from "@src/services/chords/chords";

function ChordDiagram({ name }: { name: string }) {
  const { colorScheme } = useMantineColorScheme();

  const { chord, comment } = ChordsService.getChord(name);

  if (!chord) {
    console.error(`Chord ${name} not found in the database.`);
    return <Text>Chord {name} not found in the database.</Text>;
  }

  // TODO: Add support for other instruments and tunings
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: ["E", "A", "D", "G", "B", "E"],
    },
  };

  const [pos, setPos] = useState(0);
  function posUp() {
    if (!chord) return;
    if (pos < chord.positions.length - 1) {
      setPos(pos + 1);
    }
  }
  function posDown() {
    if (!chord) return;
    if (pos > 0) {
      setPos(pos - 1);
    }
  }

  const position = chord.positions[pos];

  const lite = false; // lite true hides fingering
  const svg = <Chord key={name} chord={position} instrument={instrument} lite={lite} />;

  return (
    <Card w={"250px"} style={{ backgroundColor: colorScheme == "dark" ? "gray" : "" }}>
      <Card.Section ml={"0px"}>{svg}</Card.Section>
      <Flex direction={"column"} ta={"center"}>
        <Text size="1.4em" c="primary" fw={500}>
          {chord.key}
          {chord.suffix}
        </Text>
        <Flex direction={"row"} justify={"space-between"} align={"center"} ta="center">
          <Button variant="subtle" c="primary" onClick={posDown}>
            <IconChevronLeft />
          </Button>
          {position.baseFret && (
            <Text size="xl" c="primary">
              {position.baseFret}fr
            </Text>
          )}
          <Button variant="subtle" c="primary" onClick={posUp}>
            <IconChevronRight />
          </Button>
        </Flex>
      </Flex>
      {comment && (
        <Text size="sm" c="dimmed" mt="xs">
          {comment}
        </Text>
      )}
    </Card>
  );
}

export default ChordDiagram;
