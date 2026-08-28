export const PURPOSES = ["focus", "meal", "rest", "team"] as const;
export type Purpose = (typeof PURPOSES)[number];

export const PURPOSE_LABELS = {
  focus: "집중",
  meal: "식사",
  rest: "휴식",
  team: "팀플",
} as const satisfies Record<Purpose, string>;

export const CROWD_LEVELS = ["available", "normal", "busy"] as const;
export type CrowdLevel = (typeof CROWD_LEVELS)[number];

export const CROWD_LABELS = {
  available: "자리 많음",
  normal: "보통",
  busy: "혼잡함",
} as const satisfies Record<CrowdLevel, string>;

export const AMENITIES = ["quiet", "power", "food", "conversation", "outdoor", "group-table"] as const;
export type Amenity = (typeof AMENITIES)[number];

export const AMENITY_LABELS = {
  quiet: "조용함",
  power: "콘센트",
  food: "식사 가능",
  conversation: "대화 가능",
  outdoor: "야외",
  "group-table": "그룹 테이블",
} as const satisfies Record<Amenity, string>;

export const PLACE_IDS = [
  "library",
  "student-union",
  "basic-education-lounge",
  "engineering-lounge",
  "central-plaza",
  "study-lounge",
] as const;
export type PlaceId = (typeof PLACE_IDS)[number];

export const BUILDINGS = ["도서관", "학생회관", "기초교육관", "공학관", "중앙광장", "스터디 라운지"] as const;
export type Building = (typeof BUILDINGS)[number];

export type MapPosition = {
  readonly x: number;
  readonly y: number;
};

export type CampusPlace = {
  readonly id: PlaceId;
  readonly name: string;
  readonly position: MapPosition;
  readonly walkMinutes: number;
  readonly purposes: readonly Purpose[];
  readonly amenities: readonly Amenity[];
  readonly crowdLevel: CrowdLevel;
  readonly recommendationBlurb: string;
};

export type TimetableEntry = {
  readonly id: string;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly building: Building;
};

export type DemoContext = {
  readonly currentTime: string;
  readonly currentBuilding: Building;
  readonly purpose: Purpose;
};

export type CrowdReport = {
  readonly placeId: PlaceId;
  readonly crowdLevel: CrowdLevel;
  readonly reportedAt: string;
};
