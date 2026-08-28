import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "틈 | 다음 수업 전, 가장 좋은 선택",
  description: "순천대 학생의 공강 시간을 더 잘 쓰게 돕는 캠퍼스 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
