import assert from "node:assert";
import { describe, it } from "node:test";

import { ChordsService } from "./chords";

describe("ChordsService.getChord — reported missing chords", () => {
  it("resolves E+ to the augmented chord", () => {
    const { chord } = ChordsService.getChord("E+");
    assert.strictEqual(chord?.key, "E");
    assert.strictEqual(chord?.suffix, "aug");
  });

  it("resolves Am7(b5) to the half-diminished (m7b5) chord", () => {
    const { chord } = ChordsService.getChord("Am7(b5)");
    assert.strictEqual(chord?.key, "A");
    assert.strictEqual(chord?.suffix, "m7b5");
  });

  it("decomposes F7/C to the base F7 chord with a bass-note comment", () => {
    const { chord, comment } = ChordsService.getChord("F7/C");
    assert.strictEqual(chord?.key, "F");
    assert.strictEqual(chord?.suffix, "7");
    assert.match(comment ?? "", /C in the bass/);
  });
});

describe("ChordsService.getChord — normalization families", () => {
  it("maps the ° symbol to dim", () => {
    assert.strictEqual(ChordsService.getChord("C°").chord?.suffix, "dim");
  });

  it("maps the °7 symbol to dim7", () => {
    assert.strictEqual(ChordsService.getChord("C°7").chord?.suffix, "dim7");
  });

  it("maps the ø symbol to m7b5", () => {
    assert.strictEqual(ChordsService.getChord("Bø").chord?.suffix, "m7b5");
  });

  it("treats a lone - as minor", () => {
    assert.strictEqual(ChordsService.getChord("C-").chord?.suffix, "minor");
  });

  it("strips parentheses on other alterations", () => {
    assert.strictEqual(ChordsService.getChord("G7(b9)").chord?.suffix, "7b9");
  });
});

describe("ChordsService.getChord — regressions", () => {
  it("resolves a plain major chord", () => {
    assert.strictEqual(ChordsService.getChord("C").chord?.suffix, "major");
  });

  it("resolves a plain minor chord", () => {
    assert.strictEqual(ChordsService.getChord("Am").chord?.suffix, "minor");
  });

  it("resolves an exact slash chord that exists in the DB", () => {
    const { chord, comment } = ChordsService.getChord("C/E");
    assert.strictEqual(chord?.key, "C");
    assert.strictEqual(chord?.suffix, "/E");
    // Exact match — no fallback/decomposition comment
    assert.strictEqual(comment, "");
  });

  it("resolves maj7 chords", () => {
    assert.strictEqual(ChordsService.getChord("Cmaj7").chord?.suffix, "maj7");
  });

  it("normalizes enharmonic roots (D# -> Eb)", () => {
    assert.strictEqual(ChordsService.getChord("D#").chord?.key, "Eb");
  });
});

describe("ChordsService.isChord — detection stays strict", () => {
  it("recognizes real chords", () => {
    assert.strictEqual(ChordsService.isChord("E+"), true);
    assert.strictEqual(ChordsService.isChord("Am7(b5)"), true);
    assert.strictEqual(ChordsService.isChord("F7/C"), true);
    assert.strictEqual(ChordsService.isChord("C"), true);
  });

  it("does not treat plain words as chords via the major fallback", () => {
    // "Are"/"Bee" start with note letters but are not chords; the major
    // fallback must not make isChord report true for them.
    assert.strictEqual(ChordsService.isChord("Are"), false);
    assert.strictEqual(ChordsService.isChord("Bee"), false);
    assert.strictEqual(ChordsService.isChord("Xyz"), false);
  });
});
