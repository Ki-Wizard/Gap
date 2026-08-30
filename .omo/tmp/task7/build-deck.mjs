import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:/Users/homem/Desktop/대충 정리/code/Gap";
const OUT = `${ROOT}/.omo/tmp/task7`;
const WIDTH = 1280;
const HEIGHT = 720;
const C = {
  canvas: "#FFFDF9",
  surface: "#FFFFFF",
  ink: "#222222",
  muted: "#6A6A6A",
  divider: "#DDDDDD",
  coral: "#E94B62",
  blush: "#FDECEF",
  mint: "#DDF4E9",
  green: "#147A56",
  amber: "#9A5B00",
  black: "#191919",
};

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function imageBytes(path) {
  const bytes = await fs.readFile(path);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function addText(slide, text, x, y, w, h, size, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFamily: "Malgun Gothic",
    fontSize: size,
    bold: options.bold ?? false,
    color: options.color ?? C.ink,
    alignment: options.align ?? "left",
    verticalAlignment: options.valign ?? "middle",
  };
  return shape;
}

function addBox(slide, x, y, w, h, fill = C.surface, radius = "rounded-xl", line = C.divider) {
  return slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: 1 },
    borderRadius: radius,
  });
}

function addSlideChrome(slide, number, section) {
  slide.background.fill = C.canvas;
  const mark = slide.shapes.add({
    geometry: "ellipse",
    position: { left: 64, top: 40, width: 28, height: 28 },
    fill: C.surface,
    line: { style: "solid", fill: C.ink, width: 2 },
  });
  addText(slide, "···", 67, 38, 24, 29, 13, { bold: true, color: C.coral, align: "center" });
  addText(slide, "틈", 102, 38, 54, 30, 20, { bold: true });
  addText(slide, section, 930, 42, 250, 24, 13, { color: C.muted, align: "right" });
  addText(slide, String(number).padStart(2, "0"), 1164, 664, 52, 22, 13, { bold: true, color: C.coral, align: "right" });
  return mark;
}

function addTitle(slide, eyebrow, title, body) {
  addText(slide, eyebrow, 64, 94, 720, 28, 14, { bold: true, color: C.coral });
  addText(slide, title, 64, 128, 1110, 112, 46, { bold: true });
  if (body) addText(slide, body, 64, 244, 980, 58, 21, { color: C.muted });
}

function addBullet(slide, number, title, body, x, y, w) {
  const circle = slide.shapes.add({
    geometry: "ellipse",
    position: { left: x, top: y + 3, width: 42, height: 42 },
    fill: C.coral,
    line: { style: "solid", fill: C.coral, width: 0 },
  });
  addText(slide, String(number), x, y + 2, 42, 42, 17, { bold: true, color: C.surface, align: "center" });
  addText(slide, title, x + 60, y, w - 60, 30, 22, { bold: true });
  addText(slide, body, x + 60, y + 34, w - 60, 58, 17, { color: C.muted });
  return circle;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: WIDTH, height: HEIGHT } });

  // 1. 문제
  {
    const s = deck.slides.add();
    addSlideChrome(s, 1, "우리가 만드는 더 나은 대학생활");
    addText(s, "문제", 64, 106, 150, 30, 16, { bold: true, color: C.coral });
    addText(s, "공강이 생겼다.\n뭐 하지?", 64, 142, 590, 180, 58, { bold: true });
    addText(s, "시간은 남았지만, 좋은 선택을 찾는 데\n매번 작은 탐색과 결정을 반복합니다.", 68, 330, 560, 82, 23, { color: C.muted });
    addBox(s, 690, 118, 476, 454, C.surface, "rounded-2xl", C.ink);
    addText(s, "40분 남았는데 과제를 시작해도 될까?", 736, 158, 390, 62, 25, { bold: true });
    addText(s, "조용한 자리와 콘센트는 어디에 있지?", 736, 268, 390, 62, 25, { bold: true });
    addText(s, "다음 수업까지 이동 시간은 충분할까?", 736, 378, 390, 62, 25, { bold: true });
    addText(s, "기존 시간표는 ‘언제’를 알려주지만,\n지금 무엇을 할지는 알려주지 않습니다.", 736, 488, 380, 62, 18, { color: C.coral, bold: true });
  }

  // 2. 사용자
  {
    const s = deck.slides.add();
    addSlideChrome(s, 2, "사용자");
    addTitle(s, "WHO", "30분에서 2시간 사이,\n결정을 빨리 내려야 하는 학생", "캠퍼스 경험이 적거나 이동이 잦을수록 작은 시행착오가 쌓입니다.");
    addBox(s, 64, 344, 530, 240, C.blush, "rounded-2xl", C.blush);
    addText(s, "통학·대면 수업 학생", 100, 376, 450, 38, 28, { bold: true });
    addText(s, "공강마다 공부·식사·휴식 장소를\n빠르게 정하고 다음 수업으로 이동해야 합니다.", 100, 432, 430, 80, 20, { color: C.muted });
    addText(s, "“캠퍼스에 있지만 어디로 갈지 모르겠어요.”", 100, 526, 440, 30, 17, { bold: true, color: C.coral });
    addBox(s, 626, 344, 530, 240, C.surface, "rounded-2xl", C.divider);
    addText(s, "팀플·과제 중심 학생", 662, 376, 450, 38, 28, { bold: true });
    addText(s, "여럿이 앉을 자리, 대화 가능한 공간,\n콘센트 같은 조건을 매번 따져야 합니다.", 662, 432, 430, 80, 20, { color: C.muted });
    addText(s, "“목적에 맞는 공간을 한 번에 찾고 싶어요.”", 662, 526, 440, 30, 17, { bold: true, color: C.coral });
  }

  // 3. 해결책
  {
    const s = deck.slides.add();
    addSlideChrome(s, 3, "해결책");
    addTitle(s, "SOLUTION", "남은 시간·현재 위치·목적을\n한 번에 계산합니다", "틈은 ‘갈 수 있는 곳’이 아니라 ‘지금 가장 좋은 선택’을 이유와 함께 보여줍니다.");
    addBullet(s, 1, "시간을 읽고", "다음 수업까지 남은 시간과\n최소 이동 여유를 계산합니다.", 68, 354, 340);
    addBullet(s, 2, "목적을 맞추고", "집중·식사·휴식·팀플에\n맞는 공간만 비교합니다.", 444, 354, 340);
    addBullet(s, 3, "이유를 설명합니다", "거리·편의시설·혼잡도를\n반영한 추천 근거를 제시합니다.", 820, 354, 340);
    addBox(s, 64, 528, 1092, 72, C.black, "rounded-xl", C.black);
    addText(s, "공강이 비는 시간이 아니라, 나를 위한 시간이 되도록.", 96, 542, 1028, 42, 25, { bold: true, color: C.surface, align: "center" });
  }

  // 4. 핵심 기능
  {
    const s = deck.slides.add();
    addSlideChrome(s, 4, "핵심 기능");
    addText(s, "CORE EXPERIENCE", 64, 92, 280, 28, 14, { bold: true, color: C.coral });
    addText(s, "10초 안에 추천까지", 64, 126, 500, 64, 46, { bold: true });
    addText(s, "홈 한 화면에서 다음 수업, 목적, 추천 이유를 확인합니다.", 64, 196, 560, 42, 20, { color: C.muted });
    s.images.add({
      blob: await imageBytes(`${ROOT}/public/teum-preview.png`),
      contentType: "image/png",
      alt: "틈 서비스의 카운트다운과 추천 카드가 보이는 실제 실행 화면",
      fit: "contain",
      position: { left: 548, top: 110, width: 662, height: 430 },
    });
    addBullet(s, 1, "카운트다운", "다음 수업까지 55분", 66, 282, 420);
    addBullet(s, 2, "목적 선택", "집중·식사·휴식·팀플", 66, 388, 420);
    addBullet(s, 3, "설명 가능한 추천", "도보 시간과 한 문장 이유", 66, 494, 420);
    addText(s, "실제 앱 화면 · 1200×675", 830, 554, 350, 24, 13, { color: C.muted, align: "right" });
  }

  // 5. 추천 흐름
  {
    const s = deck.slides.add();
    addSlideChrome(s, 5, "추천 흐름");
    addTitle(s, "HOW IT WORKS", "한 번의 선택이, 바로 다음 행동으로", "12:05 도서관에서 13:00 공학관 수업을 앞둔 집중 목적 데모입니다.");
    const xs = [64, 354, 644, 934];
    for (let i = 0; i < 3; i += 1) {
      s.shapes.add({
        geometry: "rightArrow",
        position: { left: xs[i] + 224, top: 408, width: 50, height: 26 },
        fill: C.coral,
        line: { style: "solid", fill: C.coral, width: 0 },
      });
    }
    const steps = [
      ["01", "상황 확인", "55분 · 도서관\n다음 수업 공학관"],
      ["02", "목적 선택", "집중을 탭하고\n조건을 즉시 반영"],
      ["03", "추천 비교", "도보·혼잡·편의시설\n점수로 상위 3곳"],
      ["04", "현장 제보", "이 기기에 저장하고\n새로고침 후에도 유지"],
    ];
    for (let i = 0; i < steps.length; i += 1) {
      addBox(s, xs[i], 338, 232, 226, i === 0 ? C.blush : C.surface, "rounded-2xl", i === 0 ? C.coral : C.divider);
      addText(s, steps[i][0], xs[i] + 24, 360, 60, 30, 16, { bold: true, color: C.coral });
      addText(s, steps[i][1], xs[i] + 24, 404, 184, 34, 24, { bold: true });
      addText(s, steps[i][2], xs[i] + 24, 460, 184, 62, 17, { color: C.muted });
    }
  }

  // 6. 데모/기술
  {
    const s = deck.slides.add();
    addSlideChrome(s, 6, "데모 / 기술");
    addText(s, "WORKING DEMO", 64, 92, 280, 28, 14, { bold: true, color: C.coral });
    addText(s, "가볍게 시작하고,\n솔직하게 작동합니다", 64, 126, 500, 116, 44, { bold: true });
    s.images.add({
      blob: await imageBytes(`${ROOT}/.omo/tmp/task7/app-detail.png`),
      contentType: "image/png",
      alt: "추천 장소 상세와 제보 화면이 열린 실제 앱 화면",
      fit: "cover",
      position: { left: 64, top: 280, width: 650, height: 342 },
    });
    addText(s, "Next.js 16 · TypeScript", 774, 166, 388, 38, 28, { bold: true });
    addText(s, "모바일 우선 반응형 웹", 774, 226, 388, 34, 21, { color: C.muted });
    addText(s, "결정론적 추천 점수", 774, 280, 388, 34, 21, { color: C.muted });
    addText(s, "브라우저 로컬 저장", 774, 334, 388, 34, 21, { color: C.muted });
    addBox(s, 760, 414, 420, 158, C.blush, "rounded-2xl", C.blush);
    addText(s, "데이터 고지", 790, 440, 340, 30, 20, { bold: true, color: C.coral });
    addText(s, "장소와 기본 혼잡도는 큐레이션 데모 데이터입니다.\n학교 내부 API·SSO·실시간 위치는 사용하지 않습니다.", 790, 480, 344, 64, 17, { color: C.ink });
  }

  // 7. 기대 효과·향후 API 연동
  {
    const s = deck.slides.add();
    addSlideChrome(s, 7, "기대 효과 · 향후 API 연동");
    addTitle(s, "NEXT", "오늘은 결정 피로를 줄이고,\n내일은 캠퍼스 정보를 연결합니다", "학생이 10초 안에 납득 가능한 추천을 받고 다음 행동으로 이동하는 것이 첫 번째 목표입니다.");
    addBox(s, 64, 340, 500, 226, C.black, "rounded-2xl", C.black);
    addText(s, "지금 만드는 가치", 98, 370, 410, 34, 23, { bold: true, color: C.surface });
    addText(s, "• 공강 선택 시간 단축\n• 목적과 이동을 함께 고려\n• 학생 제보가 만드는 현장성", 98, 422, 410, 112, 20, { color: C.surface });
    addBox(s, 604, 340, 552, 226, C.surface, "rounded-2xl", C.divider);
    addText(s, "공식 데이터가 열리면", 638, 370, 460, 34, 23, { bold: true, color: C.coral });
    addText(s, "학식 · 도서관 운영 · 셔틀처럼\n공개·허가된 API부터 순차 연동\n비공개 학사 시스템은 사용하지 않음", 638, 422, 460, 112, 20, { color: C.ink });
    addText(s, "프로젝트 링크  https://gap-rose.vercel.app", 64, 606, 1092, 32, 15, { bold: true, color: C.muted, align: "center" });
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await writeBlob(`${OUT}/slide-${index + 1}.png`, png);
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${OUT}/slide-${index + 1}.layout.json`, await layout.text());
  }
  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(`${OUT}/deck-montage.webp`, montage);
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(`${OUT}/teum-presentation.pptx`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
