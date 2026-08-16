import { useMemo } from "react";

import { ChordsComApiInternalEntityLibraryType } from "@generated/api";

import { SharedCollection } from "@src/features/account/AccountContext";

export interface LibraryOption {
  value: string;
  label: string;
}

// Build the dropdown options: my / public / one per redeemed collection.
export function useLibraryOptions(collections?: SharedCollection[] | null): LibraryOption[] {
  return useMemo(
    () => [
      { value: "my", label: "My library" },
      { value: "public", label: "Public" },
      ...(collections || []).map((c) => ({
        value: `user:${c.owner_id}`,
        label: c.label || `User #${c.owner_id}`,
      })),
    ],
    [collections],
  );
}

// Translate a dropdown selection into the search request's library filter.
export function deriveLibraryFilter(selection: string): {
  libraryType?: ChordsComApiInternalEntityLibraryType;
  ownerId?: number;
} {
  if (selection === "public") {
    return { libraryType: undefined, ownerId: undefined };
  }
  if (selection.startsWith("user:")) {
    return { libraryType: "private", ownerId: Number(selection.slice("user:".length)) };
  }
  return { libraryType: "private", ownerId: undefined };
}
