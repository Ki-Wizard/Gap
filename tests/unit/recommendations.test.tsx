import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CAMPUS_PLACES } from "../../src/data/campus";
import { Recommendations } from "../../src/app/ui/recommendations";

describe("Recommendations", () => {
  it("uses a persisted local crowd report for the reopened detail radio selection", () => {
    // Given: a ranked library still carrying curated availability and a persisted local busy report
    const library = CAMPUS_PLACES.find((place) => place.id === "library");
    if (library === undefined) {
      throw new Error("The curated fixture must include the library");
    }

    // When: the library detail is reopened from persisted state
    render(
      <Recommendations
        currentBuilding="도서관"
        nextBuilding="공학관"
        rankedPlaces={[{ place: library, walkMinutes: 2, score: 96, usableMinutes: 43, reason: library.recommendationBlurb }]}
        reports={[{ placeId: "library", crowdLevel: "busy", reportedAt: "2026-08-30T12:05:00.000Z" }]}
        selectedPlaceId="library"
        onCloseDetail={() => undefined}
        onOpenDetail={() => undefined}
        onReport={() => undefined}
        onResetReport={() => undefined}
      />,
    );

    // Then: the local report takes precedence over stale curated detail data
    expect(screen.getByRole("radio", { name: "혼잡함" })).toBeChecked();
  });
});
