import { describe, expect, it, vi } from "vitest";

import { SAMPLE_CONTEXT, SAMPLE_TIMETABLE } from "../../src/data/campus";
import {
  STORAGE_KEY,
  createSeedState,
  loadAppState,
  resetAppState,
  saveAppState,
} from "../../src/storage/app-state";
import type { StorageLike } from "../../src/storage/app-state";

function createMemoryStorage(initialValue: string | null = null): StorageLike {
  let value = initialValue;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, nextValue: string) => {
      value = nextValue;
    }),
    removeItem: vi.fn(() => {
      value = null;
    }),
  };
}

describe("local app state", () => {
  it("persists timetable, building, and reports under the versioned key", () => {
    // Given: an editable state with one local crowd report
    const storage = createMemoryStorage();
    const state = {
      version: 1,
      timetable: SAMPLE_TIMETABLE,
      currentBuilding: SAMPLE_CONTEXT.currentBuilding,
      reports: [{ placeId: "library", crowdLevel: "busy", reportedAt: "2026-08-29T03:05:00.000Z" }],
    } as const;

    // When: the state is saved and loaded
    const saveResult = saveAppState(storage, state);
    const loadResult = loadAppState(storage);

    // Then: the complete state round-trips through the required key
    expect(saveResult.notice).toBeNull();
    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
    expect(loadResult).toEqual({ state, notice: null });
  });

  it("falls back to fresh seeds with a notice when stored JSON is corrupt", () => {
    // Given: malformed persisted JSON
    const storage = createMemoryStorage("{broken");

    // When: app state is loaded
    const result = loadAppState(storage);

    // Then: the UI can continue with seeds and a non-blocking notice
    expect(result.state).toEqual(createSeedState());
    expect(result.notice).not.toBeNull();
  });

  it("falls back to seeds when storage access throws", () => {
    // Given: an unavailable browser storage adapter
    const storage: StorageLike = {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    // When: app state is loaded
    const result = loadAppState(storage);

    // Then: the failure is non-blocking
    expect(result.state).toEqual(createSeedState());
    expect(result.notice).not.toBeNull();
  });

  it("rejects stale versioned state and uses current seeds", () => {
    // Given: valid JSON from an unsupported storage version
    const storage = createMemoryStorage('{"version":0,"timetable":[],"currentBuilding":"도서관","reports":[]}');

    // When: app state is loaded
    const result = loadAppState(storage);

    // Then: stale state cannot leak into the current contract
    expect(result.state).toEqual(createSeedState());
    expect(result.notice).not.toBeNull();
  });

  it("rejects persisted timetable entries with malformed clock values", () => {
    // Given: structurally complete state with a malformed class time
    const storage = createMemoryStorage(
      '{"version":1,"timetable":[{"id":"bad","title":"오류","startsAt":"25:99","endsAt":"26:00","building":"공학관"}],"currentBuilding":"도서관","reports":[]}',
    );

    // When: the external JSON boundary is parsed
    const result = loadAppState(storage);

    // Then: invalid time data is replaced by safe demo seeds
    expect(result.state).toEqual(createSeedState());
    expect(result.notice).not.toBeNull();
  });

  it("removes persisted state and restores editable demo defaults", () => {
    // Given: a storage adapter containing app state
    const storage = createMemoryStorage("persisted");

    // When: the user resets the demo
    const result = resetAppState(storage);

    // Then: the required key is removed and seeds are returned
    expect(storage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(result).toEqual({ state: createSeedState(), notice: null });
  });
});
