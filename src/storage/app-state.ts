import { SAMPLE_CONTEXT, SAMPLE_TIMETABLE } from "../data/campus";
import {
  BUILDINGS,
  CROWD_LEVELS,
  PLACE_IDS,
  type Building,
  type CrowdLevel,
  type CrowdReport,
  type PlaceId,
  type TimetableEntry,
} from "../domain/types";

export const STORAGE_KEY = "gap:teum:v1";

export type AppState = {
  readonly version: 1;
  readonly timetable: readonly TimetableEntry[];
  readonly currentBuilding: Building;
  readonly reports: readonly CrowdReport[];
};

export type StorageNotice = "저장된 데이터를 불러오지 못해 데모 상태로 시작했어요." | "이 브라우저에서는 저장할 수 없어요.";

export type StateResult = {
  readonly state: AppState;
  readonly notice: StorageNotice | null;
};

export type SaveResult = {
  readonly notice: StorageNotice | null;
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createSeedState(): AppState {
  return {
    version: 1,
    timetable: SAMPLE_TIMETABLE.map((entry) => ({ ...entry })),
    currentBuilding: SAMPLE_CONTEXT.currentBuilding,
    reports: [],
  };
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBuilding(value: unknown): value is Building {
  return typeof value === "string" && BUILDINGS.some((building) => building === value);
}

function isPlaceId(value: unknown): value is PlaceId {
  return typeof value === "string" && PLACE_IDS.some((placeId) => placeId === value);
}

function isCrowdLevel(value: unknown): value is CrowdLevel {
  return typeof value === "string" && CROWD_LEVELS.some((crowdLevel) => crowdLevel === value);
}

function isClockTime(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  const hourText = match?.[1];
  const minuteText = match?.[2];
  if (hourText === undefined || minuteText === undefined) {
    return false;
  }
  return Number(hourText) <= 23 && Number(minuteText) <= 59;
}

function isTimetableEntry(value: unknown): value is TimetableEntry {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    typeof value["title"] === "string" &&
    isClockTime(value["startsAt"]) &&
    isClockTime(value["endsAt"]) &&
    isBuilding(value["building"])
  );
}

function isCrowdReport(value: unknown): value is CrowdReport {
  return (
    isRecord(value) &&
    isPlaceId(value["placeId"]) &&
    isCrowdLevel(value["crowdLevel"]) &&
    typeof value["reportedAt"] === "string" &&
    !Number.isNaN(Date.parse(value["reportedAt"]))
  );
}

function isAppState(value: unknown): value is AppState {
  return (
    isRecord(value) &&
    value["version"] === 1 &&
    isUnknownArray(value["timetable"]) &&
    value["timetable"].every(isTimetableEntry) &&
    isBuilding(value["currentBuilding"]) &&
    isUnknownArray(value["reports"]) &&
    value["reports"].every(isCrowdReport)
  );
}

export function loadAppState(storage: StorageLike | null): StateResult {
  if (storage === null) {
    return { state: createSeedState(), notice: "이 브라우저에서는 저장할 수 없어요." };
  }
  try {
    const storedValue = storage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return { state: createSeedState(), notice: null };
    }
    const parsed: unknown = JSON.parse(storedValue);
    if (!isAppState(parsed)) {
      return { state: createSeedState(), notice: "저장된 데이터를 불러오지 못해 데모 상태로 시작했어요." };
    }
    return { state: parsed, notice: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { state: createSeedState(), notice: "저장된 데이터를 불러오지 못해 데모 상태로 시작했어요." };
    }
    return { state: createSeedState(), notice: "저장된 데이터를 불러오지 못해 데모 상태로 시작했어요." };
  }
}

export function saveAppState(storage: StorageLike | null, state: AppState): SaveResult {
  if (storage === null) {
    return { notice: "이 브라우저에서는 저장할 수 없어요." };
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { notice: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { notice: "이 브라우저에서는 저장할 수 없어요." };
    }
    return { notice: "이 브라우저에서는 저장할 수 없어요." };
  }
}

export function resetAppState(storage: StorageLike | null): StateResult {
  if (storage === null) {
    return { state: createSeedState(), notice: "이 브라우저에서는 저장할 수 없어요." };
  }
  try {
    storage.removeItem(STORAGE_KEY);
    return { state: createSeedState(), notice: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { state: createSeedState(), notice: "이 브라우저에서는 저장할 수 없어요." };
    }
    return { state: createSeedState(), notice: "이 브라우저에서는 저장할 수 없어요." };
  }
}
