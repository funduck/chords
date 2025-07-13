import assert from "node:assert";
import { describe, it, test } from "node:test";

import { ChordProService } from "./chordpro";

describe("ChordProService.adjustLineLength", () => {
  it("should not change lines shorter than max length", () => {
    const input = "This is a short line.";
    const result = ChordProService.adjustLineLength(input, 50);
    assert.strictEqual(result, input);
  });

  it("should split long lines into multiple lines", () => {
    const input =
      "This is a very long line that should be split into multiple lines based on the maximum length.";
    const result = ChordProService.adjustLineLength(input, 30);
    const lines = result.split("\n");
    for (const line of lines) {
      assert.ok(line.length <= 30, `Line exceeds max length: ${line}`);
    }
  });

  it("should not split lines starting with '{'", () => {
    const input =
      "{title: A Long Title}\nThis is another long line that should be split.";
    const result = ChordProService.adjustLineLength(input, 30);
    const expected =
      "{title: A Long Title}\nThis is another long line that\nshould be split.";
    assert.strictEqual(result, expected);
  });
});

describe("ChordProService.parse", () => {
  it("should parse a simple ChordPro file", () => {
    const input = "{title: Test Song}\n\nVerse 1\nThis is a test line.";
    const result = ChordProService.parse(input);
    assert.strictEqual(result.title, "Test Song");
    assert.strictEqual(result.bodyLines.length, 2);
  });

  it("should split line if it mixes diretive and text", () => {
    const input =
      "{title: Test Song}\nThis is a test line with\n{start_of_chorus}Chorus text\n{end_of_chorus}And outro.";
    const result = ChordProService.parse(input);
    assert.strictEqual(result.title, "Test Song");
    assert.strictEqual(result.bodyLines.length, 3);
  });
});
