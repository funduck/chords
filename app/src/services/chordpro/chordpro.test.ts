import assert from "node:assert";
import { describe, it } from "node:test";

import { ChordProService } from "./chordpro";

describe("ChordProService.beforeParse", () => {
  it("should convert H chords to B chords", () => {
    const input = "This is a [H] chord and [Hm] and [H7] and [Haj]";
    const result = ChordProService.beforeParse(input);
    assert.strictEqual(result, "This is a [B] chord and [Bm] and [B7] and [Baj]");
  });

  it("should handle H chords at start and end of lines", () => {
    const input = "H chord at start and H at end H";
    const result = ChordProService.beforeParse(input);
    assert.strictEqual(result, "B chord at start and B at end B");
  });

  it("should handle various H chord extensions", () => {
    const input = "Song with [H] [Hm] [H7] [Haj] [H7maj] [Hdim]";
    const result = ChordProService.beforeParse(input);
    assert.strictEqual(result, "Song with [B] [Bm] [B7] [Baj] [B7maj] [Bdim]");
  });

  it("should not affect non-H chords", () => {
    const input = "[C] [G] [Am] [F#] [Bb]";
    const result = ChordProService.beforeParse(input);
    assert.strictEqual(result, "[C] [G] [Am] [F#] [Bb]");
  });

  // Note: Chord sequence splitting is currently commented out in the implementation
  it.skip("should split chord sequences in parentheses", () => {
    const input = "Play (E/F#-E/G#-E/A) sequence";
    const result = ChordProService.beforeParse(input);
    assert.strictEqual(result, "Play E/F# E/G# E/A sequence");
  });

  it.skip("should handle mixed H replacement and chord sequences", () => {
    const input = "Mix (H-Am-H7) and Hm chord";
    const result = ChordProService.beforeParse(input);
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

  it.skip("should convert song to chords over words format", () => {
    // const inputSheet = "{title: Test Song}\n[C]Hello world";
    // const song = ChordProService.sheetToSong(inputSheet);
    // assert.notStrictEqual(song, null, "Song should be parsed successfully");
    // const outputSheet = ChordProService.songToSheet(song!, { format: "chordsoverwords" });
    // assert.ok(outputSheet.includes("Hello world"), "Should contain lyrics");
    // // ChordProFormatter output should not contain ChordPro directives in chordsoverwords format
    // assert.ok(!outputSheet.includes("{title"), "Should not contain ChordPro directives");
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

  it("should handle undefined song", () => {
    const result = ChordProService.songToSheet(undefined as any);
    assert.strictEqual(result, "", "Should return empty string for undefined song");
  });

  it("should apply afterFormat processing", () => {
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

    assert.equal(
      result,
      `First line with chords
Second line without chords
Chorus line
Final line`,
      "Should extract lyrics and preserve structure",
    );
  });
});

describe("ChordProService.adjustLineLength", () => {
  it("should not modify lines shorter than max length", () => {
    const inputSheet = "{title: Short}\nShort line";

    const outputSheet = ChordProService.adjustLineLength(inputSheet!, 50);

    assert.ok(outputSheet.includes("Short line"), "Should preserve short lines");
  });

  it("should split long lines", () => {
    const inputSheet =
      "{title: Long}\nThis is a very long line that definitely exceeds typical display limits and should be split appropriately";

    const outputSheet = ChordProService.adjustLineLength(inputSheet!, 30);
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

    const outputSheet = ChordProService.adjustLineLength(inputSheet!, 30);

    assert.ok(outputSheet.includes("{start_of_tab}"), "Should preserve tab start directive");
    assert.ok(outputSheet.includes("{end_of_tab}"), "Should preserve tab end directive");
    assert.ok(outputSheet.includes("Tab content that is very long"), "Should preserve tab content without splitting");
  });

  it("should not break inside brackets", () => {
    const inputSheet = "{title: No Break}\n[C] This is a long chord [G Am D] that should not break inside brackets";

    const outputSheet = ChordProService.adjustLineLength(inputSheet!, 30);
    assert.equal(
      outputSheet,
      "{title: No Break}\n[C] This is a long chord\n[G Am D] that should not break\ninside brackets",
      "Should not break inside brackets",
    );
  });
});

describe("ChordProService.beforeFormat", () => {
  it("should separate directives from content on same line", () => {
    const input = "Some lyrics{start_of_chorus}";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, "Some lyrics\n\n{start_of_chorus}", "Should add empty line before directive");
  });

  it("should handle start_of_tab directives", () => {
    const input = "Intro{start_of_tab}";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, "Intro\n\n{start_of_tab}", "Should separate start_of_tab directive");
  });

  it("should handle start_of_verse directives", () => {
    const input = "Verse 1{start_of_verse}";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, "Verse 1\n\n{start_of_verse}", "Should separate start_of_verse directive");
  });

  it("should handle short directive names", () => {
    const input = "Some text{sot}";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, "Some text\n\n{sot}", "Should handle short directive names");
  });

  it("should not modify lines without directives", () => {
    const input = "Regular line\nAnother line";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, input, "Should leave regular lines unchanged");
  });

  it("should not modify directives on separate lines", () => {
    const input = "Some lyrics\n{start_of_chorus}";
    const result = ChordProService.beforeFormat(input);

    assert.strictEqual(result, input, "Should not modify already separated directives");
  });
});

describe("ChordProService.afterFormat", () => {
  it("should add title directive when missing", () => {
    const input = "[C]Hello world";
    const result = ChordProService.afterFormat(input);

    assert.ok(result.startsWith("{title}\n"), "Should add title directive at the beginning");
  });

  it("should not add title if already present", () => {
    const input = "{title: My Song}\n[C]Hello world";
    const result = ChordProService.afterFormat(input);

    assert.ok(!result.startsWith("{title}\n{title:"), "Should not duplicate title directives");
  });

  it("should remove empty sections", () => {
    const input = "[  ]\n[C]Hello\n[   ]";
    const result = ChordProService.afterFormat(input);

    assert.ok(!result.includes("[  ]"), "Should remove empty sections");
    assert.ok(!result.includes("[   ]"), "Should remove empty sections with spaces");
  });

  it("should recognize chords without brackets and add them", () => {
    const input = "C (G-Am) [F]";
    const result = ChordProService.afterFormat(input);

    assert.equal(result, "{title}\n[C] ([G]-[Am]) [F]", "Should recognize chords without brackets and add them");
  });

  it("should not modify chords already in brackets", () => {
    const input = "[C]Hello [G]world";
    const result = ChordProService.afterFormat(input);

    assert.ok(result.includes("[C]Hello [G]world"), "Should preserve existing chord brackets");
  });
});
