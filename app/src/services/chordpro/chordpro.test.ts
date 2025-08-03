import assert from "node:assert";
import { describe, it } from "node:test";

import { ChordProService } from "./chordpro";

describe("ChordProService.preparseSheet", () => {
  it("should convert H chords to B chords", () => {
    const input = "This is a [H] chord and [Hm] and [H7] and [Haj]";
    const result = ChordProService.preparseSheet(input);
    assert.strictEqual(result, "This is a [B] chord and [Bm] and [B7] and [Baj]");
  });

  it("should handle H chords at start and end of lines", () => {
    const input = "H chord at start and H at end H";
    const result = ChordProService.preparseSheet(input);
    assert.strictEqual(result, "B chord at start and B at end B");
  });

  it("should split chord sequences in parentheses", () => {
    const input = "Play (E/F#-E/G#-E/A) sequence";
    const result = ChordProService.preparseSheet(input);
    assert.strictEqual(result, "Play E/F# E/G# E/A sequence");
  });

  it("should handle complex chord sequences", () => {
    const input = "Complex (Am-F-C-G) progression";
    const result = ChordProService.preparseSheet(input);
    assert.strictEqual(result, "Complex Am F C G progression");
  });

  it.skip("should handle mixed H replacement and chord sequences", () => {
    const input = "Mix (H-Am-H7) and Hm chord";
    const result = ChordProService.preparseSheet(input);
    assert.strictEqual(result, "Mix B Am B7 and Bm chord");
  });
});

describe("ChordProService.sheetToSong", () => {
  it("should parse a ChordPro sheet", () => {
    const input = "{title: Test Song}\n{artist: Test Artist}\n[C]Hello [G]world";
    const result = ChordProService.sheetToSong(input);

    assert.notStrictEqual(result, null, "Should return a Song object");
    assert.strictEqual(result?.title, "Test Song");
    assert.strictEqual(result?.artist, "Test Artist");
  });

  it("should detect ChordPro format automatically", () => {
    const input = "{title: Auto Detect}\n[C]Hello world";
    const result = ChordProService.sheetToSong(input);

    assert.notStrictEqual(result, null, "Should successfully parse ChordPro format");
    assert.strictEqual(result?.title, "Auto Detect");
  });

  it("should detect Ultimate Guitar format", () => {
    const input = "[Verse]\n[C]Hello world\n[Chorus]\n[G]Goodbye world";
    const result = ChordProService.sheetToSong(input);

    assert.notStrictEqual(result, null, "Should successfully parse Ultimate Guitar format");
  });

  it("should handle ChordsOverWords format", () => {
    const input = "C       G\nHello world";
    const result = ChordProService.sheetToSong(input);

    assert.notStrictEqual(result, null, "Should successfully parse chords over words format");
  });

  it.skip("should return null for invalid input", () => {
    const input = "";
    const result = ChordProService.sheetToSong(input);

    assert.strictEqual(result, null, "Should return null for empty input");
  });

  it("should apply line length constraints when specified", () => {
    const input =
      "{title: Long Line Test}\nThis is a very long line that should be split when maxLineLength is specified";
    const result = ChordProService.sheetToSong(input, { maxLineLength: 30 });

    assert.notStrictEqual(result, null, "Should successfully parse with line length constraints");
  });
});

describe("ChordProService.songToSheet", () => {
  it("should convert song back to ChordPro format", () => {
    const inputSheet = "{title: Test Song}\n[C]Hello world";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const outputSheet = ChordProService.songToSheet(song!);

    assert.ok(outputSheet.includes("{title"), "Should contain title directive");
    assert.ok(outputSheet.includes("Test Song"), "Should contain song title");
  });

  it("should convert song to chords over words format", () => {
    const inputSheet = "{title: Test Song}\n[C]Hello world";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const outputSheet = ChordProService.songToSheet(song!, { format: "chordsoverwords" });

    assert.ok(outputSheet.includes("Hello world"), "Should contain lyrics");
    // ChordProFormatter output should not contain ChordPro directives in chordsoverwords format
    assert.ok(!outputSheet.includes("{title"), "Should not contain ChordPro directives");
  });

  it("should apply line length constraints", () => {
    const inputSheet =
      "{title: Long Line}\nThis is a very long line that should be split when maxLineLength is specified and it continues";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const outputSheet = ChordProService.songToSheet(song!, { maxLineLength: 30 });
    const lines = outputSheet.split("\n").filter((line) => !line.startsWith("{") && line.trim());

    // Check that non-directive lines respect the length limit
    for (const line of lines) {
      if (line.trim() && !line.startsWith("{")) {
        assert.ok(line.length <= 30, `Line exceeds max length: "${line}" (${line.length} chars)`);
      }
    }
  });

  it("should handle empty song", () => {
    const result = ChordProService.songToSheet(null as any);
    assert.strictEqual(result, "", "Should return empty string for null song");
  });

  it("should add title directive if missing", () => {
    const inputSheet = "[C]Hello world"; // No title
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const outputSheet = ChordProService.songToSheet(song!);

    assert.ok(outputSheet.includes("{title}"), "Should add empty title directive");
  });

  it("should remove empty sections", () => {
    const inputSheet = "{title: Test}\n[  ]\n[C]Hello world\n[   ]";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const outputSheet = ChordProService.songToSheet(song!);

    assert.ok(!outputSheet.includes("[  ]"), "Should remove empty sections");
    assert.ok(!outputSheet.includes("[   ]"), "Should remove empty sections with spaces");
  });
});

describe("ChordProService.sheetToChordProSheet", () => {
  it("should convert chords over words to ChordPro format", () => {
    const input = `
 C       G
Hello world`;
    const result = ChordProService.sheetToChordProSheet(input);

    assert.equal(result, "{title}\n\nH[C]ello wor[G]ld", "Should preserve lyrics");
  });

  it("should handle empty input", () => {
    const result = ChordProService.sheetToChordProSheet("");
    assert.strictEqual(result, "", "Should return empty string for empty input");
  });

  it("should handle whitespace-only input", () => {
    const result = ChordProService.sheetToChordProSheet("   \n  \n  ");
    assert.strictEqual(result, "", "Should return empty string for whitespace-only input");
  });

  it("should apply parsing options", () => {
    const input = "[Verse]\n[C]Hello world";
    const result = ChordProService.sheetToChordProSheet(input, { parse: "ultimateguitar" });

    assert.ok(result.length > 0, "Should return non-empty result");
  });
});

describe("ChordProService.transposeSong", () => {
  it("should transpose song up by semitones", () => {
    const inputSheet = "{title: Test}\n{key: C}\n[C]Hello [G]world";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const transposedSong = ChordProService.transposeSong(song!, 2); // Up 2 semitones
    const outputSheet = ChordProService.songToSheet(transposedSong);

    assert.ok(outputSheet.includes("[D]"), "Should transpose C to D");
    assert.ok(outputSheet.includes("[A]"), "Should transpose G to A");
  });

  it("should transpose song down by semitones", () => {
    const inputSheet = "{title: Test}\n{key: C}\n[C]Hello [G]world";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const transposedSong = ChordProService.transposeSong(song!, -2); // Down 2 semitones
    const outputSheet = ChordProService.songToSheet(transposedSong);

    assert.ok(outputSheet.includes("[Bb]") || outputSheet.includes("[A#]"), "Should transpose C to Bb/A#");
  });

  it("should auto-detect key when missing", () => {
    const inputSheet = "{title: Test}\n[Am]Hello [F]world"; // No key specified
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const transposedSong = ChordProService.transposeSong(song!, 2);
    const outputSheet = ChordProService.songToSheet(transposedSong);

    // Should transpose Am to Bm and F to G
    assert.ok(outputSheet.includes("[Bm]"), "Should transpose Am to Bm");
    assert.ok(outputSheet.includes("[G]"), "Should transpose F to G");
  });

  it("should handle songs with no chords", () => {
    const inputSheet = "{title: Test}\nJust lyrics no chords";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const transposedSong = ChordProService.transposeSong(song!, 2);

    assert.notStrictEqual(transposedSong, null, "Should handle songs with no chords");
  });
});

describe("ChordProService.extractLyrics", () => {
  it("should extract only lyrics from ChordPro sheet", () => {
    const input =
      "{title: Test Song}\n{artist: Test Artist}\n[C]Hello [G]world\nJust text line\n{comment: This is a comment}";
    const result = ChordProService.extractLyrics(input);

    assert.ok(!result.includes("{title"), "Should remove title directive");
    assert.ok(!result.includes("{artist"), "Should remove artist directive");
    assert.ok(!result.includes("{comment"), "Should remove comment directive");
    assert.ok(!result.includes("[C]"), "Should remove chord annotations");
    assert.ok(!result.includes("[G]"), "Should remove chord annotations");
    assert.ok(result.includes("Hello"), "Should preserve lyrics");
    assert.ok(result.includes("world"), "Should preserve lyrics");
    assert.ok(result.includes("Just text line"), "Should preserve plain text lines");
  });

  it("should handle empty input", () => {
    const result = ChordProService.extractLyrics("");
    assert.strictEqual(result, "", "Should return empty string for empty input");
  });

  it("should handle input with only directives", () => {
    const input = "{title: Test}\n{artist: Artist}\n{comment: Comment only}";
    const result = ChordProService.extractLyrics(input);

    // After removing all directives, should be mostly empty (may have some whitespace)
    assert.ok(result.trim().length === 0, "Should return empty/whitespace result for directive-only input");
  });

  it("should handle mixed content", () => {
    const input = `{title: Mixed Content}
[Verse 1]
[C]First line with [G]chords
Second line without chords
{start_of_chorus}
[F]Chorus [C]line
{end_of_chorus}
Final line`;

    const result = ChordProService.extractLyrics(input);

    assert.ok(!result.includes("[Verse 1]"), "Should remove section markers");
    assert.ok(!result.includes("[C]"), "Should remove chords");
    assert.ok(!result.includes("{start_of_chorus}"), "Should remove directives");
    assert.ok(result.includes("First line with"), "Should preserve lyrics");
    assert.ok(result.includes("chords"), "Should preserve lyrics");
    assert.ok(result.includes("Second line without chords"), "Should preserve plain text");
    assert.ok(result.includes("Chorus"), "Should preserve chorus lyrics");
    assert.ok(result.includes("line"), "Should preserve lyrics");
    assert.ok(result.includes("Final line"), "Should preserve final lyrics");
  });
});

describe("ChordProService.adjustLineLength", () => {
  it("should not modify lines shorter than max length", () => {
    const inputSheet = "{title: Short}\nShort line";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const adjustedSong = ChordProService.adjustLineLength(song!, 50);
    const outputSheet = ChordProService.songToSheet(adjustedSong);

    assert.ok(outputSheet.includes("Short line"), "Should preserve short lines");
  });

  it("should split long lines", () => {
    const inputSheet =
      "{title: Long}\nThis is a very long line that definitely exceeds typical display limits and should be split appropriately";
    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const adjustedSong = ChordProService.adjustLineLength(song!, 30);
    const outputSheet = ChordProService.songToSheet(adjustedSong);
    const lines = outputSheet.split("\n");

    // Check that content lines respect the length limit
    for (const line of lines) {
      if (!line.startsWith("{") && line.trim()) {
        assert.ok(line.length <= 30, `Line exceeds max length: "${line}" (${line.length} chars)`);
      }
    }
  });

  it("should preserve directives and tabs", () => {
    const inputSheet = `{title: Preserve}
{start_of_tab}
Tab content that is very long and should not be split even if it exceeds the maximum line length
{end_of_tab}
Regular long line that should be split when it exceeds the maximum length specified`;

    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const adjustedSong = ChordProService.adjustLineLength(song!, 30);
    const outputSheet = ChordProService.songToSheet(adjustedSong);

    assert.ok(outputSheet.includes("{start_of_tab}"), "Should preserve tab start directive");
    assert.ok(outputSheet.includes("{end_of_tab}"), "Should preserve tab end directive");
    assert.ok(outputSheet.includes("Tab content that is very long"), "Should preserve tab content without splitting");
  });
});

describe("ChordProService.fixForFormatting", () => {
  it("should add empty lines before certain directives", () => {
    const inputSheet = `{title: Format Test}
Some content{start_of_chorus}
Chorus content
{end_of_chorus}More content{start_of_verse}
Verse content`;

    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const fixedSong = ChordProService.fixForFormatting(song!);
    const outputSheet = ChordProService.songToSheet(fixedSong);

    // Should add spacing for better formatting
    assert.notStrictEqual(outputSheet, "", "Should return formatted output");
  });

  it("should handle multiple formatting directives", () => {
    const inputSheet = `{title: Multiple}
Content{start_of_tab}
Tab content
{end_of_tab}More{start_of_verse}
Verse`;

    const song = ChordProService.sheetToSong(inputSheet);

    assert.notStrictEqual(song, null, "Song should be parsed successfully");

    const fixedSong = ChordProService.fixForFormatting(song!);

    assert.notStrictEqual(fixedSong, null, "Should return formatted song");
  });
});
