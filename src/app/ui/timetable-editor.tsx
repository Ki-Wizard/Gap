import { BUILDINGS, type Building, type TimetableEntry } from "../../domain/types";
import { Icon } from "./app-icon";

type TimetableEditorProps = {
  readonly entries: readonly TimetableEntry[];
  readonly onAdd: () => void;
  readonly onChange: (entry: TimetableEntry) => void;
  readonly onRemove: (id: string) => void;
};

function isClockTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isBuilding(value: string): value is Building {
  return BUILDINGS.some((building) => building === value);
}

export function TimetableEditor({
  entries,
  onAdd,
  onChange,
  onRemove,
}: TimetableEditorProps): React.ReactElement {
  return (
    <section className="panel timetable-panel" aria-labelledby="timetable-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">MY SCHEDULE</p>
          <h2 id="timetable-title">내 시간표</h2>
        </div>
        <button className="icon-text-button" type="button" onClick={onAdd}>
          <Icon name="plus" size={17} /> 수업 추가
        </button>
      </div>

      <p className="data-note">학교 시스템과 연결되지 않은 이 브라우저의 데모 시간표예요.</p>

      <div className="timetable-list">
        {entries.length === 0 ? (
          <p className="list-empty">아직 수업이 없어요. 수업을 추가해 공강을 계산해 보세요.</p>
        ) : entries.map((entry) => (
          <fieldset className="class-row" key={entry.id}>
            <legend className="sr-only">{entry.title || "이름 없는 수업"} 수정</legend>
            <span className="class-dot" aria-hidden="true" />
            <label className="field class-name">
              <span>수업명</span>
              <input
                maxLength={24}
                value={entry.title}
                onChange={(event) => onChange({ ...entry, title: event.currentTarget.value })}
              />
            </label>
            <label className="field time-field">
              <span>시작</span>
              <input
                type="time"
                value={entry.startsAt}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isClockTime(value)) {
                    onChange({ ...entry, startsAt: value });
                  }
                }}
              />
            </label>
            <label className="field building-field">
              <span>건물</span>
              <select
                value={entry.building}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isBuilding(value)) {
                    onChange({ ...entry, building: value });
                  }
                }}
              >
                {BUILDINGS.map((building) => <option key={building}>{building}</option>)}
              </select>
            </label>
            <button
              className="remove-button"
              type="button"
              aria-label={`${entry.title || "이름 없는"} 수업 삭제`}
              onClick={() => onRemove(entry.id)}
            >
              <Icon name="trash" size={17} />
            </button>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
