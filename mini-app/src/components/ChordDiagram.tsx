import { Button, Card, Flex, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Chord from "@techies23/react-chords";
import { Chord as ChordJS } from "chordsheetjs";
import { useState } from "react";

import ChordsDB from "@src/data/chords-db";

type ChordDto = {
  frets: number[];
  fingers: number[];
  barres?: number[];
  capo?: boolean;
  baseFret?: number;
};

function ChordDiagram({ name }: { name: string }) {
  const chordjs = ChordJS.parse(name);
  if (!chordjs) {
    console.error(`Failed to parse chord name: ${name}`);
    return <Text>Failed to parse chord name: {name}</Text>;
  }
  const note = chordjs.root?.note || name;
  const suffix = chordjs.suffix || "";

  let chord = ChordsDB.chords.get(note)?.get(suffix || "major");
  if (!chord) {
    console.warn(`Chord not found for ${note} with suffix ${suffix}. Using default chord.`);
    // Fallback to major chord if no specific suffix found
    chord = ChordsDB.chords.get(note)?.get("maj") || ChordsDB.chords.get(note)?.get("");
  }
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: ["E", "A", "D", "G", "B", "E"],
    },
  };

  if (!chord) {
    console.error(`Chord ${name} not found in the database.`);
    return <Text>Chord {name} not found in the database.</Text>;
  }

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

  const dto: ChordDto = {
    fingers: position.fingers,
    frets: position.frets,
    barres: position.barres,
    capo: position.capo || false,
    baseFret: position.baseFret || 0,
  };

  const lite = false; // lite true hides fingering
  const svg = <Chord key={name} chord={dto} instrument={instrument} lite={lite} />;

  return (
    <Card shadow="sm" withBorder w={"250px"}>
      <Card.Section ml={"0px"}>{svg}</Card.Section>
      <Flex direction={"row"} justify={"space-between"} align={"center"}>
        <Button variant="subtle" c="primary" onClick={posDown}>
          <IconChevronLeft />
        </Button>
        <Text size="1.5em" fw={500}>
          {name}
        </Text>
        <Button variant="subtle" c="primary" onClick={posUp}>
          <IconChevronRight />
        </Button>
      </Flex>
    </Card>
  );
}

export default ChordDiagram;
