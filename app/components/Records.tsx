import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BarChart3, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { deleteScoreRecord, getScoreRecords, type ScoreRecord } from "../lib/scoreRecords";

type RecordMode = "practice" | "mock_test";

const gradeOrder = ["NL", "NM", "NH", "IL", "IM1", "IM2", "IM3", "IH", "AL"];
const modeLabels: Record<RecordMode, string> = {
  practice: "연습 모드",
  mock_test: "모의고사 모드",
};

const detailMetricLabels = [
  { key: "wordCount", label: "평균 단어 수", suffix: "개", max: 160 },
  { key: "sentenceCount", label: "평균 문장 수", suffix: "개", max: 20 },
  { key: "speechRateWpm", label: "발화 속도", suffix: " wpm", max: 180 },
  { key: "silenceRatio", label: "침묵 비율", suffix: "%", max: 100, percent: true },
  { key: "connectorCount", label: "연결어", suffix: "개", max: 12 },
  { key: "lexicalDiversity", label: "어휘 다양도", suffix: "%", max: 100, percent: true },
  { key: "repetitionRate", label: "반복 비율", suffix: "%", max: 100, percent: true },
  { key: "keywordSimilarity", label: "주제 일치도", suffix: "%", max: 100, percent: true },
] as const;

const scoreMetricLabels: Record<string, string> = {
  grammar: "문법",
  fluency: "유창성",
  vocabulary: "어휘",
  completion: "답변 완성도",
  relevance: "질문 적합도",
  speed: "속도",
  engagement: "호응 유도",
};

function formatDate(value: string, includeYear = true) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ko-KR", {
    year: includeYear ? "numeric" : undefined,
    month: "2-digit",
    day: "2-digit",
  });
}

function getGradeValue(grade: string) {
  const index = gradeOrder.indexOf(grade);
  return index >= 0 ? index : 0;
}

function metricValue(value: number | undefined, percent = false) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const adjusted = percent ? (value as number) * 100 : (value as number);
  return Number.isInteger(adjusted) ? adjusted : Number(adjusted.toFixed(1));
}

function RecentGradeTrend({ records }: { records: ScoreRecord[] }) {
  const recentRecords = records.slice(0, 5).reverse();
  const width = 640;
  const height = 210;
  const padding = { top: 18, right: 18, bottom: 38, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = recentRecords.map((record) => getGradeValue(record.grade));
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : gradeOrder.length - 1;
  const yMin = Math.max(0, minValue - 1);
  const yMax = Math.min(gradeOrder.length - 1, maxValue + 1);
  const yRange = Math.max(1, yMax - yMin);
  const visibleGrades = gradeOrder
    .map((grade, index) => ({ grade, index }))
    .filter((item) => item.index >= yMin && item.index <= yMax);

  const points = recentRecords.map((record, index) => {
    const x = padding.left + (recentRecords.length <= 1 ? plotWidth / 2 : (index / (recentRecords.length - 1)) * plotWidth);
    const y = padding.top + plotHeight - ((getGradeValue(record.grade) - yMin) / yRange) * plotHeight;
    return { record, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${path} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`
      : "";

  return (
    <Card className="border-2 border-yellow-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">최근 등급 변화</h2>
          <p className="text-xs text-gray-500">최근 5개 기록 기준</p>
        </div>
      </div>

      {recentRecords.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-yellow-50 text-sm text-gray-500">
          기록이 쌓이면 변화 그래프가 표시됩니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[520px] rounded-xl bg-white">
            <defs>
              <linearGradient id="gradeTrendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {visibleGrades.map(({ grade, index }) => {
              const y = padding.top + plotHeight - ((index - yMin) / yRange) * plotHeight;
              return (
                <g key={grade}>
                  <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-[10px] font-semibold">
                    {grade}
                  </text>
                </g>
              );
            })}

            {points.map(({ x }, index) => (
              <line
                key={`x-${index}`}
                x1={x}
                x2={x}
                y1={padding.top}
                y2={padding.top + plotHeight}
                stroke="#f1f5f9"
                strokeWidth="1.5"
              />
            ))}

            {points.length > 1 && <path d={areaPath} fill="url(#gradeTrendFill)" />}
            {points.length > 1 && <path d={path} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

            {points.map(({ record, x, y }, index) => (
              <g key={record.id}>
                <circle cx={x} cy={y} r="5" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={y - 13} textAnchor="middle" className="fill-gray-900 text-[11px] font-bold">
                  {record.grade}
                </text>
                <text x={x} y={height - 15} textAnchor="middle" className="fill-gray-500 text-[10px] font-semibold">
                  {index + 1}회
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </Card>
  );
}

function GradeBars({
  record,
  expanded,
  onToggle,
}: {
  record: ScoreRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const currentIndex = gradeOrder.indexOf(record.grade);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5 sm:gap-2">
        {gradeOrder.map((grade, index) => {
          const isCurrent = index === currentIndex;
          const fallbackHeight = 22 + index * 6;
          const height = isCurrent ? Math.min(92, fallbackHeight + 10) : fallbackHeight;

          return (
            <div key={grade} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end rounded-md bg-white/80 px-1">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isCurrent ? "bg-yellow-400" : index < currentIndex ? "bg-gray-300" : "bg-gray-200"
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className={`text-[10px] font-semibold sm:text-xs ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                {grade}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-900 px-4 py-3 text-white">
        <div>
          <p className="text-xs font-semibold text-yellow-300">예상 OPIc 등급</p>
          <p className="text-3xl font-black">{record.grade}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="h-8 shrink-0 gap-1.5 border-yellow-300 bg-white px-3 text-xs font-semibold text-gray-900 hover:bg-yellow-50"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          상세 정보
        </Button>
      </div>
    </div>
  );
}

function DetailBar({ label, value, max, suffix }: { label: string; value: number | null; max: number; suffix: string }) {
  const safeValue = value ?? 0;
  const percentage = Math.max(0, Math.min((safeValue / max) * 100, 100));

  return (
    <div className="grid min-h-12 grid-cols-[7rem_1fr_4.75rem] items-center gap-3 rounded-xl border border-yellow-100 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-right text-sm font-semibold text-gray-900">
        {value == null ? "-" : `${value}${suffix}`}
      </p>
    </div>
  );
}

function RecordCard({
  record,
  expanded,
  onToggle,
  onDelete,
}: {
  record: ScoreRecord;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden border-2 border-yellow-200 bg-yellow-50 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
            {modeLabels[record.mode as RecordMode]}
          </span>
          <h3 className="mt-3 text-xl font-bold text-gray-900">{record.title}</h3>
          <p className="text-sm text-gray-500">{formatDate(record.updatedAt)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="기록 삭제">
          <Trash2 className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      <GradeBars record={record} expanded={expanded} onToggle={onToggle} />

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-yellow-200 bg-white/75 p-3"
        >
          <div className="grid gap-2">
            {detailMetricLabels.map((item) => {
              const value = metricValue(record.metrics[item.key], item.percent);
              return <DetailBar key={item.key} label={item.label} value={value} max={item.max} suffix={item.suffix} />;
            })}
          </div>

          {Object.keys(record.categoryScores).length > 0 && (
            <div className="mt-4 grid gap-2 lg:grid-cols-2">
              {Object.entries(record.categoryScores).map(([key, value]) => (
                <DetailBar key={key} label={scoreMetricLabels[key] || key} value={value} max={100} suffix="점" />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}

export function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(() => getScoreRecords());
  const [activeMode, setActiveMode] = useState<RecordMode>("practice");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const visibleRecords = useMemo(
    () => records.filter((record) => record.mode === activeMode),
    [activeMode, records],
  );
  const practiceCount = records.filter((record) => record.mode === "practice").length;
  const mockTestCount = records.filter((record) => record.mode === "mock_test").length;

  const toggleRecord = (recordId: string) => {
    setExpandedIds((current) =>
      current.includes(recordId) ? current.filter((item) => item !== recordId) : [...current, recordId],
    );
  };

  const handleDelete = (recordId: string) => {
    deleteScoreRecord(recordId);
    setRecords(getScoreRecords());
    setExpandedIds((current) => current.filter((item) => item !== recordId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">점수 기록 확인</h1>
            <p className="text-gray-600">저장된 평가 결과를 연습과 모의고사로 나누어 확인하세요.</p>
          </div>
        </div>

        <div className="sticky top-0 z-20 mb-6 space-y-3 bg-gray-50 pb-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-2 shadow-sm">
            {(["practice", "mock_test"] as RecordMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveMode(mode)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  activeMode === mode ? "bg-yellow-400 text-gray-900" : "text-gray-600 hover:bg-yellow-50"
                }`}
              >
                {modeLabels[mode]} ({mode === "practice" ? practiceCount : mockTestCount})
              </button>
            ))}
          </div>
          <RecentGradeTrend records={visibleRecords} />
        </div>

        {visibleRecords.length === 0 ? (
          <Card className="bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
              <BarChart3 className="h-7 w-7 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">아직 저장된 점수 기록이 없습니다</h2>
            <p className="mt-2 text-sm text-gray-600">
              결과 화면을 확인하면 예상 등급과 세부 지표가 자동으로 기록됩니다.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {visibleRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                expanded={expandedIds.includes(record.id)}
                onToggle={() => toggleRecord(record.id)}
                onDelete={() => handleDelete(record.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
