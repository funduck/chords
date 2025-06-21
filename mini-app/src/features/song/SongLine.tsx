import { useSignal } from "@telegram-apps/sdk-react";

import Text from "@src/components/Text";
import { Signals } from "@src/services/signals-registry";
import { SongLineDto } from "@src/services/song.service";

function SongLine({ line }: { line: SongLineDto }) {
  const settings = useSignal(Signals.applySongSettings);

  return (
    <Text>
      {settings?.show_chords ? (
        <>
          {/* Chords over words */}
          {line.words.map((word, index) => {
            const chord = line.chords.find((chord) => chord.position === index);
            return (
              <span key={`chord-${index}`}>
                <span>{chord?.name}</span>
                <span className="hidden">{String(word).substring(chord?.name.length ?? 0)} </span>
              </span>
            );
          })}
          {/* Remaining chords in line */}
          {line.chords
            .filter((chord) => chord.position >= line.words.length)
            .map((chord, index) => (
              <span key={`chord-${index}`}>{chord?.name} </span>
            ))}
          <br />
        </>
      ) : (
        <></>
      )}

      {/* Words */}
      {line.words.map((word, index) => (
        <span key={`word-${index}`}>{word} </span>
      ))}
      <br />
      <br />
    </Text>
  );
}

export default SongLine;
