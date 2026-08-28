import type { CampusPlace } from "../../domain/types";

type CampusMapProps = {
  readonly places: readonly CampusPlace[];
  readonly selectedPlace: CampusPlace;
};

export function CampusMap({ places, selectedPlace }: CampusMapProps): React.ReactElement {
  return (
    <div className="campus-map" role="img" aria-label={`정적 캠퍼스 도식, ${selectedPlace.name} 선택됨`}>
      <svg viewBox="0 0 100 76" aria-hidden="true">
        <path className="map-path" d="M18 26 31 34l15 23 14-19 18-3M31 34l15 23 20 4M46 57l4-9 10-10" />
        {places.map((place) => {
          const isSelected = place.id === selectedPlace.id;
          return (
            <g className={isSelected ? "map-node selected" : "map-node"} key={place.id}>
              <circle cx={place.position.x} cy={place.position.y} r={isSelected ? 4 : 2.6} />
              <text x={place.position.x} y={place.position.y - 5} textAnchor="middle">{place.name}</text>
            </g>
          );
        })}
      </svg>
      <p>실제 길찾기가 아닌 위치 관계를 단순화한 캠퍼스 도식이에요.</p>
    </div>
  );
}
