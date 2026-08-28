import { describe, expect, it } from "vitest";

import {
  CAMPUS_PLACES,
  CampusDataError,
  SAMPLE_CONTEXT,
  SAMPLE_TIMETABLE,
  assertValidCampusPlaces,
} from "../../src/data/campus";
import { findNextClass } from "../../src/domain/recommendation";

describe("campus demo data", () => {
  it("contains exactly six complete places with unique ids", () => {
    // Given: the curated SCNU demo dataset
    const ids = CAMPUS_PLACES.map((place) => place.id);

    // When: its contract is checked
    const validate = () => assertValidCampusPlaces(CAMPUS_PLACES);

    // Then: every required record is complete and ids are unique
    expect(validate).not.toThrow();
    expect(CAMPUS_PLACES).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  it("rejects duplicate place ids", () => {
    // Given: two otherwise valid places sharing an id
    const duplicatePlaces = [CAMPUS_PLACES[0], CAMPUS_PLACES[0]].filter(
      (place) => place !== undefined,
    );

    // When: the fixture is validated
    const validate = () => assertValidCampusPlaces(duplicatePlaces);

    // Then: duplicate data is rejected at the boundary
    expect(validate).toThrowError(CampusDataError);
  });

  it("rejects a place without a supported purpose", () => {
    // Given: a typed place with an empty purpose list
    const firstPlace = CAMPUS_PLACES[0];
    if (firstPlace === undefined) {
      throw new Error("The curated fixture must include a first place");
    }
    const incompletePlace = { ...firstPlace, purposes: [] };

    // When: the fixture is validated
    const validate = () => assertValidCampusPlaces([incompletePlace]);

    // Then: incomplete data is rejected
    expect(validate).toThrowError(CampusDataError);
  });

  it("provides the 13:00 engineering class after the 12:05 demo context", () => {
    // Given: the editable sample timetable and seeded current time
    // When: the next class is selected
    const nextClass = findNextClass(SAMPLE_TIMETABLE, SAMPLE_CONTEXT.currentTime);

    // Then: the planned demo class is available
    expect(nextClass).toMatchObject({ startsAt: "13:00", building: "공학관" });
  });
});
