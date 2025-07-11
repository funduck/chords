import { ChordsOverWordsParser } from "chordsheetjs";

export function main() {
  console.log("TypeScript tools project initialized!");
  console.log("Available tools:");
  console.log("- parse-md: Parse markdown files with chords");

  // Example usage of chordsheetjs
  const parser = new ChordsOverWordsParser();
  console.log("ChordsOverWordsParser initialized successfully");
}

// Run main function if this file is executed directly
if (require.main === module) {
  main();
}
