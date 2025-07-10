import { Box, Flex, Modal } from "@mantine/core";
import { useEffect, useState } from "react";

import ChordDiagram from "./ChordDiagram";

function ChordDisplayManager() {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleChordClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("chord")) {
        const chordName = target.textContent?.trim();
        if (chordName) {
          setSelectedChord(chordName);
          setIsOpen(true);
        }
      }
    };

    // Add event listener to document for event delegation
    document.addEventListener("click", handleChordClick);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleChordClick);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedChord(null);
  };

  return (
    <Modal opened={isOpen} onClose={handleClose} withCloseButton={false} centered>
      {/* <Modal opened={isOpen} onClose={handleClose} title={"Chord diagram: " + selectedChord} centered> */}
      <Flex justify="center" align="center" style={{ height: "100%" }}>
        {selectedChord && <ChordDiagram name={selectedChord} />}
      </Flex>
    </Modal>
  );
}

export default ChordDisplayManager;
