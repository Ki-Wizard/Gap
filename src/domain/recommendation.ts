import type { Amenity, Building, CampusPlace, CrowdLevel, PlaceId, Purpose, TimetableEntry } from "./types";

const PURPOSE_AMENITIES = {
  focus: ["quiet", "power"],
  meal: ["food", "conversation"],
  rest: ["outdoor", "conversation"],
  team: ["conversation", "group-table"],
} as const satisfies Record<Purpose, readonly Amenity[]>;

export type RecommendationContext = {
  readonly purpose: Purpose;
  readonly minutesRemaining: number;
  readonly currentBuilding?: Building;
};

export type RankedPlace = {
  readonly place: CampusPlace;
  readonly walkMinutes: number;
  readonly score: number;
  readonly usableMinutes: number;
  readonly reason: string;
};

const BUILDING_ANCHOR_PLACE_IDS = {
  "도서관": "library",
  "학생회관": "student-union",
  "기초교육관": "basic-education-lounge",
  "공학관": "engineering-lounge",
  "중앙광장": "central-plaza",
  "스터디 라운지": "study-lounge",
} as const satisfies Record<Building, PlaceId>;

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

function mapDistance(left: CampusPlace, right: CampusPlace): number {
  return Math.hypot(left.position.x - right.position.x, left.position.y - right.position.y);
}

function walkMinutesFromCurrentBuilding(
  places: readonly CampusPlace[],
  place: CampusPlace,
  currentBuilding: Building | undefined,
): number {
  if (currentBuilding === undefined || currentBuilding === "도서관") {
    return place.walkMinutes;
  }

  const library = places.find((candidate) => candidate.id === "library");
  const anchorId = BUILDING_ANCHOR_PLACE_IDS[currentBuilding];
  const anchor = places.find((candidate) => candidate.id === anchorId);
  if (library === undefined || anchor === undefined) {
    return place.walkMinutes;
  }
  if (place.id === anchor.id) {
    return 0;
  }
  if (place.id === library.id) {
    return anchor.walkMinutes;
  }

  const libraryDistance = mapDistance(library, place);
  if (libraryDistance === 0) {
    return place.walkMinutes;
  }
  return Math.max(1, Math.round(place.walkMinutes * mapDistance(anchor, place) / libraryDistance));
}

function scorePlace(
  place: CampusPlace,
  context: RecommendationContext,
  walkMinutes: number,
): RankedPlace {
  const usableMinutes = context.minutesRemaining - walkMinutes - 10;
  const purposeMatch = place.purposes.includes(context.purpose) ? 40 : 0;
  const timeFit = usableMinutes >= 20 ? 25 : 10;
  const score =
    purposeMatch +
    timeFit +
    amenityScore(place, context.purpose) +
    availabilityScore(place.crowdLevel) -
    walkMinutes * 2;

  return { place, walkMinutes, score, usableMinutes, reason: place.recommendationBlurb };
}

export function rankPlaces(
  places: readonly CampusPlace[],
  context: RecommendationContext,
): readonly RankedPlace[] {
  return places
    .flatMap((place) => {
      const walkMinutes = walkMinutesFromCurrentBuilding(places, place, context.currentBuilding);
      return isEligiblePlace({ ...place, walkMinutes }, context.minutesRemaining)
        ? [scorePlace(place, context, walkMinutes)]
        : [];
    })
    .toSorted(
      (left, right) =>
        right.score - left.score ||
        left.walkMinutes - right.walkMinutes ||
        left.place.name.localeCompare(right.place.name, "ko"),
    );
}
