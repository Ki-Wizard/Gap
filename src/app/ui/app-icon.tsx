export const ICON_NAMES = [
  "arrow", "book", "clock", "close", "coffee", "location",
  "people", "plus", "spark", "trash", "utensils",
] as const;

type IconName = (typeof ICON_NAMES)[number];

type IconProps = {
  readonly name: IconName;
  readonly size?: number;
};

export function Icon({ name, size = 20 }: IconProps): React.ReactElement {
  const commonProps = {
    "aria-hidden": true,
    className: "icon",
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.9,
    viewBox: "0 0 24 24",
    width: size,
  } as const;

  switch (name) {
    case "arrow":
      return <svg {...commonProps}><path d="m9 18 6-6-6-6" /></svg>;
    case "book":
      return <svg {...commonProps}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>;
    case "clock":
      return <svg {...commonProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "close":
      return <svg {...commonProps}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "coffee":
      return <svg {...commonProps}><path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" /><path d="M16 10h2a2 2 0 1 1 0 4h-2M7 4v1m4-1v1" /></svg>;
    case "location":
      return <svg {...commonProps}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "people":
      return <svg {...commonProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "plus":
      return <svg {...commonProps}><path d="M12 5v14M5 12h14" /></svg>;
    case "spark":
      return <svg {...commonProps}><path d="m12 3-1.2 4.2A5 5 0 0 1 7.3 10L3 12l4.3 2a5 5 0 0 1 3.5 2.8L12 21l1.2-4.2a5 5 0 0 1 3.5-2.8l4.3-2-4.3-2a5 5 0 0 1-3.5-2.8Z" /></svg>;
    case "trash":
      return <svg {...commonProps}><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6m4-6v6" /></svg>;
    case "utensils":
      return <svg {...commonProps}><path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18m0-18c-3 3-3 8 0 10" /></svg>;
  }
}
