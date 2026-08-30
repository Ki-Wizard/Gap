import type { CampusPlace, DemoContext, TimetableEntry } from "../domain/types";

export const CAMPUS_PLACES = [
  {
    id: "library",
    name: "도서관",
    position: { x: 30, y: 34 },
    walkMinutes: 2,
    purposes: ["focus", "rest"],
    amenities: ["quiet", "power"],
    crowdLevel: "available",
    recommendationBlurb: "가까운 조용한 자리에서 과제를 시작하기 좋아요.",
  },
  {
    id: "student-union",
    name: "학생회관",
    position: { x: 46, y: 57 },
    walkMinutes: 6,
    purposes: ["meal", "rest", "team"],
    amenities: ["food", "conversation"],
    crowdLevel: "normal",
    recommendationBlurb: "식사와 짧은 휴식을 한 번에 해결할 수 있어요.",
  },
  {
    id: "basic-education-lounge",
    name: "기초교육관 라운지",
    position: { x: 60, y: 38 },
    walkMinutes: 5,
    purposes: ["focus", "rest", "team"],
    amenities: ["power", "conversation", "group-table"],
    crowdLevel: "normal",
    recommendationBlurb: "콘센트와 테이블이 있어 가벼운 과제나 팀플에 알맞아요.",
  },
  {
    id: "engineering-lounge",
    name: "공학관 라운지",
    position: { x: 78, y: 35 },
    walkMinutes: 8,
    purposes: ["focus", "rest", "team"],
    amenities: ["power", "conversation", "group-table"],
    crowdLevel: "available",
    recommendationBlurb: "다음 수업 건물과 가까워 편해요.",
  },
  {
    id: "central-plaza",
    name: "중앙광장",
    position: { x: 50, y: 48 },
    walkMinutes: 5,
    purposes: ["meal", "rest"],
    amenities: ["food", "outdoor", "conversation"],
    crowdLevel: "normal",
    recommendationBlurb: "바람을 쐬며 간단히 먹거나 머리를 식히기 좋아요.",
  },
  {
    id: "study-lounge",
    name: "스터디 라운지",
    position: { x: 66, y: 61 },
    walkMinutes: 7,
    purposes: ["focus", "team"],
    amenities: ["quiet", "power", "group-table"],
    crowdLevel: "normal",
    recommendationBlurb: "집중 좌석과 그룹 테이블을 목적에 맞게 고를 수 있어요.",
  },
] as const satisfies readonly CampusPlace[];

export const SAMPLE_TIMETABLE = [
  {
    id: "sample-writing",
    title: "사고와 글쓰기",
    startsAt: "09:00",
    endsAt: "10:15",
    building: "기초교육관",
  },
  {
    id: "sample-engineering",
    title: "컴퓨팅 사고",
    startsAt: "13:00",
    endsAt: "14:15",
    building: "공학관",
  },
] as const satisfies readonly TimetableEntry[];

export const SAMPLE_CONTEXT = {
  currentTime: "12:05",
  currentBuilding: "도서관",
  purpose: "focus",
} as const satisfies DemoContext;

export class CampusDataError extends Error {
  readonly code: "duplicate-id" | "missing-purpose" | "missing-blurb";

  constructor(code: CampusDataError["code"]) {
    super(`Invalid curated campus data: ${code}`);
    this.name = "CampusDataError";
    this.code = code;
  }
}

export function assertValidCampusPlaces(places: readonly CampusPlace[]): void {
  const ids = new Set<string>();
  for (const place of places) {
    if (ids.has(place.id)) {
      throw new CampusDataError("duplicate-id");
    }
    if (place.purposes.length === 0) {
      throw new CampusDataError("missing-purpose");
    }
    if (place.recommendationBlurb.trim().length === 0) {
      throw new CampusDataError("missing-blurb");
    }
    ids.add(place.id);
  }
}

assertValidCampusPlaces(CAMPUS_PLACES);
