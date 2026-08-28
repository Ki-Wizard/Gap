import { describe, expect, it } from "vitest";

import { CAMPUS_PLACES, SAMPLE_CONTEXT, SAMPLE_TIMETABLE } from "../../src/data/campus";
import {
  calculateMinutesRemaining,
  findNextClass,
  isEligiblePlace,
  rankPlaces,
} from "../../src/domain/recommendation";
import type { CampusPlace } from "../../src/domain/types";

describe("gap-time recommendation", () => {
  it("ranks 도서관 first for the 12:05 focus demo", () => {
    // Given: the seeded library context and the 13:00 engineering class
    const nextClass = findNextClass(SAMPLE_TIMETABLE, SAMPLE_CONTEXT.currentTime);
    if (nextClass === null) {
      throw new Error("The demo timetable must have a next class");
    }
    const minutesRemaining = calculateMinutesRemaining(SAMPLE_CONTEXT.currentTime, nextClass.startsAt);

    // When: focus recommendations are ranked
    const recommendations = rankPlaces(CAMPUS_PLACES, {
      purpose: "focus",
      minutesRemaining,
    });

    // Then: the nearby library is the strongest recommendation
    expect(recommendations[0]?.place.name).toBe("도서관");
  });

  it("excludes a place that cannot preserve the ten-minute class buffer", () => {
    // Given: a fifteen-minute gap and a six-minute walk
    const remotePlace = { ...CAMPUS_PLACES[0], walkMinutes: 6 };

    // When: eligibility is evaluated
    const eligible = isEligiblePlace(remotePlace, 15);

    // Then: the remote candidate is excluded
    expect(eligible).toBe(false);
  });

  it("applies the exact full-fit score contract", () => {
    // Given: the available library with both focus amenities and 55 minutes remaining
    const library = CAMPUS_PLACES.find((place) => place.id === "library");
    if (library === undefined) {
      throw new Error("The curated fixture must include the library");
    }

    // When: its focus recommendation is scored
    const recommendation = rankPlaces([library], { purpose: "focus", minutesRemaining: 55 })[0];

    // Then: 40 purpose + 25 time + 20 amenities + 15 availability - 4 walking is applied
    expect(recommendation?.score).toBe(96);
  });

  it("uses the ten-point time fit below twenty usable minutes", () => {
    // Given: the library leaves nineteen usable minutes after walking and class buffer
    const library = CAMPUS_PLACES.find((place) => place.id === "library");
    if (library === undefined) {
      throw new Error("The curated fixture must include the library");
    }

    // When: its short-gap focus recommendation is scored
    const recommendation = rankPlaces([library], { purpose: "focus", minutesRemaining: 31 })[0];

    // Then: the reduced time fit produces the exact score
    expect(recommendation?.score).toBe(81);
  });

  it("orders equal scores by shorter walk and then Korean place name", () => {
    // Given: three equivalent focus places with a walk tie for two of them
    const base = CAMPUS_PLACES[0];
    if (base === undefined) {
      throw new Error("The curated fixture must include a first place");
    }
    const places: readonly CampusPlace[] = [
      { ...base, id: "engineering-lounge", name: "하늘", walkMinutes: 6, crowdLevel: "normal" },
      { ...base, id: "central-plaza", name: "가람", walkMinutes: 6, crowdLevel: "normal" },
      { ...base, id: "library", name: "나래", walkMinutes: 2, crowdLevel: "busy" },
    ];

    // When: the places have intentionally equal final scores
    const ranked = rankPlaces(places, { purpose: "focus", minutesRemaining: 55 });

    // Then: shorter walking wins, followed by locale-independent name order
    expect(ranked.map((item) => item.place.name)).toEqual(["나래", "가람", "하늘"]);
  });

  it("calculates minutes remaining without using wall-clock time", () => {
    // Given: two explicit timetable clock values
    // When: their difference is calculated
    const remaining = calculateMinutesRemaining("12:05", "13:00");

    // Then: the deterministic gap is returned
    expect(remaining).toBe(55);
  });
});
