import type { TimetableEntry } from "../../domain/types";
import { Icon } from "./app-icon";

type DashboardHeaderProps = {
  readonly currentTime: string;
  readonly minutesRemaining: number | null;
  readonly nextClass: TimetableEntry | null;
  readonly onReset: () => void;
};

export function DashboardHeader({
  currentTime,
  minutesRemaining,
  nextClass,
  onReset,
}: DashboardHeaderProps): React.ReactElement {
  return (
    <header className="hero">
      <nav className="brand-row" aria-label="서비스 메뉴">
        <a className="brand" href="#top" aria-label="틈 홈">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>틈</span>
        </a>
        <button className="text-button" type="button" onClick={onReset}>
          데모 상태로 초기화
        </button>
      </nav>

      <div className="hero-copy">
        <p className="eyebrow"><Icon name="spark" size={16} /> 국립순천대학교 · 데모 시각 {currentTime}</p>
        <h1 aria-label="틈">공강이 생겼다.<br /><span>뭐 하지?</span></h1>
        <p className="intro">다음 수업 전, 가장 좋은 캠퍼스 선택을 추천해요.</p>
      </div>

      <section className="countdown-card" aria-label="다음 수업 안내">
        <div className="countdown-label"><Icon name="clock" size={18} /> 다음 수업까지</div>
        {nextClass === null || minutesRemaining === null ? (
          <div className="countdown-empty">
            <strong>오늘 일정이 비어 있어요</strong>
            <span>시간표를 추가하면 딱 맞는 틈을 찾아드릴게요.</span>
          </div>
        ) : (
          <>
            <div className="countdown-value"><strong>{minutesRemaining}</strong><span>분</span></div>
            <div className="next-class">
              <span>{nextClass.startsAt}</span>
              <strong>{nextClass.title}</strong>
              <span><Icon name="location" size={15} /> {nextClass.building}</span>
            </div>
          </>
        )}
      </section>
    </header>
  );
}
