import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const EVIDENCE_DIR = resolve(".omo/evidence/gap-service");

test.beforeAll(() => {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "데모 상태로 초기화" }).click();
});

test("student gets a focused recommendation and keeps a local crowd report", async ({ page }) => {
  // Given: the seeded 12:05 gap at the library
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("다음 수업까지")).toBeVisible();
  await expect(page.getByText("55분")).toBeVisible();
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-4-mobile.png") });

  // When: the student chooses focus and opens the first recommendation
  await page.getByText("집중", { exact: true }).click();
  const firstRecommendation = page.getByTestId("recommendation-card").first();
  await expect(firstRecommendation).toContainText("도서관");
  await firstRecommendation.getByRole("button", { name: /자세히 보기/ }).click();

  // Then: a transparent route summary and local-only report control are available
  await expect(page.getByRole("dialog", { name: "도서관 상세" })).toContainText(
    "도서관 → 도서관 → 공학관",
  );
  await page.getByText("혼잡함", { exact: true }).click();
  await expect(page.getByText("이 기기의 제보로 저장했어요.")).toBeVisible();
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-5-report-flow.png") });
  await page.getByRole("button", { name: "상세 닫기" }).click();
  await expect(page.getByTestId("recommendation-card").filter({ hasText: "도서관" })).toContainText("혼잡함");

  // When: the browser reloads
  await page.reload();

  // Then: the local report persists and remains honestly labelled
  const reportedLibrary = page.getByTestId("recommendation-card").filter({ hasText: "도서관" });
  await expect(reportedLibrary).toContainText("혼잡함");
  await expect(reportedLibrary).toContainText("이 기기의 제보");

  // When: the student resets after confirming persistence
  await page.getByRole("button", { name: "데모 상태로 초기화" }).click();

  // Then: the curated baseline is restored
  const resetLibrary = page.getByTestId("recommendation-card").filter({ hasText: "도서관" });
  await expect(resetLibrary).toContainText("자리 많음");
  await expect(resetLibrary).not.toContainText("이 기기의 제보");
});

test("student can remove future classes and recover the demo", async ({ page }) => {
  // Given: the seeded timetable has one future class
  const timetable = page.getByRole("region", { name: "내 시간표" });

  // When: every class is removed
  const removeButtons = timetable.getByRole("button", { name: /수업 삭제/ });
  while ((await removeButtons.count()) > 0) {
    await removeButtons.first().click();
  }

  // Then: recommendations are replaced by a useful empty state
  await expect(page.getByRole("heading", { name: "다음 수업이 없어요" })).toBeVisible();
  await expect(page.getByTestId("recommendation-card")).toHaveCount(0);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-4-empty-state.png") });

  // When: the student resets the demo
  await page.getByRole("button", { name: "샘플 시간표 복원" }).click();

  // Then: the seeded countdown returns
  await expect(page.getByText("55분")).toBeVisible();
});

test("storage failure stays usable and is clearly disclosed", async ({ context, page }) => {
  // Given: localStorage writes fail in this browser
  await context.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });

  // When: the page opens and a local change is attempted
  await page.reload();
  await page.getByRole("combobox", { name: "지금 어디에 있나요?" }).selectOption("학생회관");

  // Then: the core recommendation remains usable with a non-blocking notice
  await expect(page.getByRole("status")).toContainText("이 브라우저에서는 저장할 수 없어요.");
  await expect(page.getByTestId("recommendation-card").first()).toBeVisible();
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-5-storage-fallback.png") });
});

test("desktop dashboard remains unclipped", async ({ page }) => {
  // Given: a desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // Then: both primary columns and the top recommendation are visible
  await expect(page.getByRole("region", { name: "공강 추천" })).toBeVisible();
  await expect(page.getByRole("region", { name: "내 시간표" })).toBeVisible();
  await expect(page.getByTestId("recommendation-card").first()).toBeVisible();
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-6-desktop.png") });
});

test("mobile dashboard fits the required submission viewport", async ({ page }) => {
  // Given: the required mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });

  // Then: the purpose picker and recommendation flow stay usable without horizontal overflow
  await expect(page.getByRole("group", { name: "이 틈에 뭘 하고 싶나요?" })).toBeVisible();
  await expect(page.getByRole("region", { name: "공강 추천" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, "task-6-mobile.png") });
});

test("unknown route preserves the Next.js 404 response", async ({ page }) => {
  const missingResponse = await page.goto("/this-route-does-not-exist");
  expect(missingResponse?.status()).toBe(404);
});
