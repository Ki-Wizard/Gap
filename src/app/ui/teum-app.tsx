"use client";

import { useEffect, useMemo, useState } from "react";

import { CAMPUS_PLACES, SAMPLE_CONTEXT } from "../../data/campus";
import { calculateMinutesRemaining, findNextClass, rankPlaces } from "../../domain/recommendation";
import {
  BUILDINGS,
  PURPOSE_LABELS,
  PURPOSES,
  type Building,
  type CampusPlace,
  type CrowdLevel,
  type PlaceId,
  type Purpose,
  type TimetableEntry,
} from "../../domain/types";
import {
  createSeedState,
  loadAppState,
  resetAppState,
  saveAppState,
  type AppState,
  type StorageLike,
  type StorageNotice,
} from "../../storage/app-state";
import { DashboardHeader } from "./dashboard-header";
import { Icon } from "./app-icon";
import { Recommendations } from "./recommendations";
import { TimetableEditor } from "./timetable-editor";

const PURPOSE_ICONS = {
  focus: "book",
  meal: "utensils",
  rest: "coffee",
  team: "people",
} as const;

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return null;
    }
    throw error;
  }
}

function isBuilding(value: string): value is Building {
  return BUILDINGS.some((building) => building === value);
}

function withLocalReports(state: AppState): readonly CampusPlace[] {
  return CAMPUS_PLACES.map((place) => {
    const report = state.reports.find((candidate) => candidate.placeId === place.id);
    if (report === undefined) {
      return place;
    }
    return { ...place, crowdLevel: report.crowdLevel };
  });
}

export function TeumApp(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>(createSeedState);
  const [notice, setNotice] = useState<StorageNotice | null>(null);
  const [purpose, setPurpose] = useState<Purpose>(SAMPLE_CONTEXT.purpose);
  const [selectedPlaceId, setSelectedPlaceId] = useState<PlaceId | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = loadAppState(browserStorage());
      setAppState(result.state);
      setNotice(result.notice);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const nextClass = useMemo(
    () => findNextClass(appState.timetable, SAMPLE_CONTEXT.currentTime),
    [appState.timetable],
  );
  const minutesRemaining = nextClass === null
    ? null
    : calculateMinutesRemaining(SAMPLE_CONTEXT.currentTime, nextClass.startsAt);
  const rankedPlaces = minutesRemaining === null
    ? []
    : rankPlaces(withLocalReports(appState), {
      purpose,
      minutesRemaining,
      currentBuilding: appState.currentBuilding,
    });

  function persist(nextState: AppState): void {
    setAppState(nextState);
    const result = saveAppState(browserStorage(), nextState);
    setNotice(result.notice);
  }

  function resetDemo(): void {
    const result = resetAppState(browserStorage());
    setAppState(result.state);
    setNotice(result.notice);
    setPurpose(SAMPLE_CONTEXT.purpose);
    setSelectedPlaceId(null);
  }

  function changeEntry(entry: TimetableEntry): void {
    persist({
      ...appState,
      timetable: appState.timetable.map((candidate) => candidate.id === entry.id ? entry : candidate),
    });
  }

  function addEntry(): void {
    const entry: TimetableEntry = {
      id: `local-${Date.now()}`,
      title: "새 수업",
      startsAt: "15:00",
      endsAt: "16:15",
      building: "공학관",
    };
    persist({ ...appState, timetable: [...appState.timetable, entry] });
  }

  function reportCrowd(placeId: PlaceId, crowdLevel: CrowdLevel): void {
    const reports = appState.reports.filter((report) => report.placeId !== placeId);
    persist({
      ...appState,
      reports: [...reports, { placeId, crowdLevel, reportedAt: new Date().toISOString() }],
    });
  }

  function resetReport(placeId: PlaceId): void {
    persist({
      ...appState,
      reports: appState.reports.filter((report) => report.placeId !== placeId),
    });
  }

  return (
    <main id="top" className="app-shell">
      <DashboardHeader
        currentTime={SAMPLE_CONTEXT.currentTime}
        minutesRemaining={minutesRemaining}
        nextClass={nextClass}
        onReset={resetDemo}
      />

      {notice === null ? null : (
        <div className="storage-notice" role="status">
          <Icon name="spark" size={17} />
          <span>{notice} 추천 기능은 그대로 사용할 수 있어요.</span>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="experience-column">
          <section className="panel choice-panel" aria-labelledby="purpose-title">
            <div className="location-control">
              <label htmlFor="current-building"><Icon name="location" size={18} /> 지금 어디에 있나요?</label>
              <select
                id="current-building"
                value={appState.currentBuilding}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isBuilding(value)) {
                    persist({ ...appState, currentBuilding: value });
                  }
                }}
              >
                {BUILDINGS.map((building) => <option key={building}>{building}</option>)}
              </select>
            </div>

            <fieldset className="purpose-control">
              <legend id="purpose-title">이 틈에 뭘 하고 싶나요?</legend>
              <div className="purpose-options">
                {PURPOSES.map((option) => (
                  <label htmlFor={`purpose-${option}`} key={option}>
                    <input
                      id={`purpose-${option}`}
                      type="radio"
                      name="purpose"
                      checked={purpose === option}
                      onChange={() => setPurpose(option)}
                    />
                    <span><Icon name={PURPOSE_ICONS[option]} size={19} />{PURPOSE_LABELS[option]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          {nextClass === null ? (
            <section className="empty-state" aria-labelledby="empty-title">
              <div className="empty-art" aria-hidden="true"><Icon name="clock" size={32} /></div>
              <p className="section-kicker">A WIDE OPEN GAP</p>
              <h2 id="empty-title">다음 수업이 없어요</h2>
              <p>시간표에 다음 수업을 추가하거나 샘플 시간표를 복원하면 장소를 추천해 드릴게요.</p>
              <button className="primary-button" type="button" onClick={resetDemo}>샘플 시간표 복원</button>
            </section>
          ) : (
            <Recommendations
              currentBuilding={appState.currentBuilding}
              nextBuilding={nextClass.building}
              rankedPlaces={rankedPlaces}
              reports={appState.reports}
              selectedPlaceId={selectedPlaceId}
              onCloseDetail={() => setSelectedPlaceId(null)}
              onOpenDetail={setSelectedPlaceId}
              onReport={reportCrowd}
              onResetReport={resetReport}
            />
          )}
        </div>

        <aside className="schedule-column">
          <TimetableEditor
            entries={appState.timetable}
            onAdd={addEntry}
            onChange={changeEntry}
            onRemove={(id) => persist({
              ...appState,
              timetable: appState.timetable.filter((entry) => entry.id !== id),
            })}
          />
          <section className="truth-card" aria-label="데이터 안내">
            <span className="truth-icon"><Icon name="spark" size={19} /></span>
            <div><strong>솔직한 데모예요</strong><p>장소와 기본 혼잡도는 큐레이션 데이터이며, 제보는 서버 없이 이 기기에만 남아요.</p></div>
          </section>
        </aside>
      </div>
      <footer>틈 · 우리가 만드는 더 나은 대학생활 <span>SCNU campus demo</span></footer>
    </main>
  );
}
