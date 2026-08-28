import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

describe("HomePage", () => {
  it("renders the service introduction when a visitor opens the home route", () => {
    // Given: a new visitor without app state
    // When: the home page renders
    render(<HomePage />);

    // Then: the service name and its purpose are available as visible content
    expect(screen.getByRole("heading", { level: 1, name: "틈" })).toBeInTheDocument();
    expect(screen.getByText("다음 수업 전, 가장 좋은 캠퍼스 선택을 추천해요.")).toBeInTheDocument();
  });
});
