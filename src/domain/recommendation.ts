import type { Amenity, CampusPlace, CrowdLevel, Purpose, TimetableEntry } from "./types";

const PURPOSE_AMENITIES = {
  focus: ["quiet", "power"],
  meal: ["food", "conversation"],
  rest: ["outdoor", "conversation"],
  team: ["conversation", "group-table"],
} as const satisfies Record<Purpose, readonly Amenity[]>;

export type RecommendationContext = {
  readonly purpose: Purpose;
  readonly minutesRemaining: number;
};

export type RankedPlace = {
  readonly place: CampusPlace;
  readonly score: number;
  readonly usableMinutes: number;
  readonly reason: string;
};

export class InvalidClockTimeError extends Error {
  readonly clockTime: string;

  constructor(clockTime: string) {
    super(`Invalid 24-hour clock time: ${clockTime}`);
    this.name = "InvalidClockTimeError";
    this.clockTime = clockTime;
  }
}

function parseClockMinutes(clockTime: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(clockTime);
  const hourText = match?.[1];
  const minuteText = match?.[2];
  if (hourText === undefined || minuteText === undefined) {
    throw new InvalidClockTimeError(clockTime);
  }
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours > 23 || minutes > 59) {
    throw new InvalidClockTimeError(clockTime);
  }
  return hours * 60 + minutes;
}

export function findNextClass(
  timetable: readonly TimetableEntry[],
  currentTime: string,
): TimetableEntry | null {
  const currentMinutes = parseClockMinutes(currentTime);
  const futureClasses = timetable
    .filter((entry) => parseClockMinutes(entry.startsAt) > currentMinutes)
    .toSorted((left, right) => parseClockMinutes(left.startsAt) - parseClockMinutes(right.startsAt));
  return futureClasses[0] ?? null;
}

export function calculateMinutesRemaining(currentTime: string, nextClassTime: string): number {
  return Math.max(0, parseClockMinutes(nextClassTime) - parseClockMinutes(currentTime));
}

export function isEligiblePlace(place: CampusPlace, minutesRemaining: number): boolean {
  return place.walkMinutes + 10 <= minutesRemaining;
}

function availabilityScore(crowdLevel: CrowdLevel): number {
  switch (crowdLevel) {
    case "available":
      return 15;
    case "normal":
      return 8;
    case "busy":
      return 0;
  }
}

function amenityScore(place: CampusPlace, purpose: Purpose): number {
  const relevantAmenities: readonly Amenity[] = PURPOSE_AMENITIES[purpose];
  return Math.min(
    20,
    place.amenities.filter((amenity) => relevantAmenities.includes(amenity)).length * 10,
  );
}

function scorePlace(place: CampusPlace, context: RecommendationContext): RankedPlace {
  const usableMinutes = context.minutesRemaining - place.walkMinutes - 10;
  const purposeMatch = place.purposes.includes(context.purpose) ? 40 : 0;
  const timeFit = usableMinutes >= 20 ? 25 : 10;
  const score =
    purposeMatch +
    timeFit +
    amenityScore(place, context.purpose) +
    availabilityScore(place.crowdLevel) -
    place.walkMinutes * 2;

  return { place, score, usableMinutes, reason: place.recommendationBlurb };
}

export function rankPlaces(
  places: readonly CampusPlace[],
  context: RecommendationContext,
): readonly RankedPlace[] {
  return places
    .filter((place) => isEligiblePlace(place, context.minutesRemaining))
    .map((place) => scorePlace(place, context))
    .toSorted(
      (left, right) =>
        right.score - left.score ||
        left.place.walkMinutes - right.place.walkMinutes ||
        left.place.name.localeCompare(right.place.name, "ko"),
    );
}
