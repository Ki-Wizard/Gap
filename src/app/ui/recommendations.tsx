import {
  AMENITY_LABELS,
  CROWD_LABELS,
  CROWD_LEVELS,
  type Building,
  type CrowdLevel,
  type CrowdReport,
  type PlaceId,
} from "../../domain/types";
import type { RankedPlace } from "../../domain/recommendation";
import { CampusMap } from "./campus-map";
import { Icon } from "./app-icon";

type RecommendationsProps = {
  readonly currentBuilding: Building;
  readonly nextBuilding: Building;
  readonly rankedPlaces: readonly RankedPlace[];
  readonly reports: readonly CrowdReport[];
  readonly selectedPlaceId: PlaceId | null;
  readonly onCloseDetail: () => void;
  readonly onOpenDetail: (placeId: PlaceId) => void;
  readonly onReport: (placeId: PlaceId, crowdLevel: CrowdLevel) => void;
  readonly onResetReport: (placeId: PlaceId) => void;
};

function reportFor(reports: readonly CrowdReport[], placeId: PlaceId): CrowdReport | null {
  return reports.find((report) => report.placeId === placeId) ?? null;
}

function amenityIcon(amenity: keyof typeof AMENITY_LABELS): "book" | "coffee" | "people" | "utensils" {
  switch (amenity) {
    case "quiet":
    case "power":
      return "book";
    case "food":
      return "utensils";
    case "conversation":
    case "group-table":
      return "people";
    case "outdoor":
      return "coffee";
  }
}

export function Recommendations({
  currentBuilding,
  nextBuilding,
  rankedPlaces,
  reports,
  selectedPlaceId,
  onCloseDetail,
  onOpenDetail,
  onReport,
  onResetReport,
}: RecommendationsProps): React.ReactElement {
  const selected = rankedPlaces.find(({ place }) => place.id === selectedPlaceId) ?? null;
  const selectedReport = selected === null ? null : reportFor(reports, selected.place.id);

  return (
    <section className="recommendations" aria-label="공강 추천">
      <div className="section-heading recommendations-heading">
        <div>
          <p className="section-kicker">BEST 3 FOR YOUR GAP</p>
          <h2 id="recommendations-title">지금 가기 좋은 곳</h2>
        </div>
        <span className="demo-badge">큐레이션 데모</span>
      </div>

      <div className="recommendation-list">
        {rankedPlaces.slice(0, 3).map((ranked, index) => {
          const { place } = ranked;
          const report = reportFor(reports, place.id);
          return (
            <article className="recommendation-card" data-testid="recommendation-card" key={place.id}>
              <div className="rank-number" aria-label={`${index + 1}순위`}>{index + 1}</div>
              <div className="card-main">
                <div className="card-title-row">
                  <h3>{place.name}</h3>
                  <span className={`crowd-badge crowd-${place.crowdLevel}`}>
                    <span aria-hidden="true" />{CROWD_LABELS[place.crowdLevel]}
                  </span>
                </div>
                <p className="reason">{ranked.reason}</p>
                <div className="card-meta">
                  <span><Icon name="location" size={16} /> 걸어서 약 {ranked.walkMinutes}분</span>
                  <span><Icon name="clock" size={16} /> 머물 시간 {ranked.usableMinutes}분</span>
                </div>
                <div className="amenity-list" aria-label="편의 시설">
                  {place.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity}><Icon name={amenityIcon(amenity)} size={14} />{AMENITY_LABELS[amenity]}</span>
                  ))}
                </div>
                {report === null ? (
                  <p className="report-source">혼잡도는 큐레이션 데모 데이터예요.</p>
                ) : (
                  <p className="report-source local">이 기기의 제보 · {new Date(report.reportedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>
                )}
              </div>
              <button
                className="detail-button"
                type="button"
                aria-label={`${place.name} 자세히 보기`}
                onClick={() => onOpenDetail(place.id)}
              >
                자세히 <Icon name="arrow" size={17} />
              </button>
            </article>
          );
        })}
      </div>

      {selected === null ? null : (
        <div className="detail-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onCloseDetail();
          }
        }}>
          <section className="detail-sheet" role="dialog" aria-modal="true" aria-label={`${selected.place.name} 상세`}>
            <div className="detail-handle" aria-hidden="true" />
            <button className="close-button" type="button" aria-label="상세 닫기" onClick={onCloseDetail}>
              <Icon name="close" />
            </button>
            <p className="section-kicker">PLACE DETAIL</p>
            <h2>{selected.place.name}</h2>
            <p className="detail-copy">{selected.reason}</p>

            <CampusMap places={rankedPlaces.map(({ place }) => place)} selectedPlace={selected.place} />

            <div className="route-summary">
              <p><Icon name="location" size={18} /> 추천 이동 흐름</p>
              <strong>{currentBuilding} → {selected.place.name} → {nextBuilding}</strong>
              <span>도보 약 {selected.walkMinutes}분 · 실제 시간은 달라질 수 있어요.</span>
            </div>

            <fieldset className="report-control">
              <legend>지금 이곳은 어떤가요?</legend>
              <p>제보는 이 기기에만 저장되며 다른 학생과 공유되지 않아요.</p>
              <div className="report-options">
                {CROWD_LEVELS.map((level) => (
                  <label htmlFor={`crowd-${selected.place.id}-${level}`} key={level}>
                    <input
                      id={`crowd-${selected.place.id}-${level}`}
                      type="radio"
                      name={`crowd-${selected.place.id}`}
                      checked={(selectedReport?.crowdLevel ?? selected.place.crowdLevel) === level}
                      onChange={() => onReport(selected.place.id, level)}
                    />
                    <span>{CROWD_LABELS[level]}</span>
                  </label>
                ))}
              </div>
              {selectedReport === null ? null : (
                <div className="report-confirmation">
                  <span role="status">이 기기의 제보로 저장했어요.</span>
                  <button type="button" onClick={() => onResetReport(selected.place.id)}>제보 초기화</button>
                </div>
              )}
            </fieldset>
          </section>
        </div>
      )}
    </section>
  );
}
