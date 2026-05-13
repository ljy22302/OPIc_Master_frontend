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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function metricValue(value: number | undefined, percent = false) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const adjusted = percent ? (value as number) * 100 : (value as number);
  return Number.isInteger(adjusted) ? adjusted : Number(adjusted.toFixed(1));
}

function GradeBars({ record }: { record: ScoreRecord }) {
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
              <div className="flex h-24 w-full items-end rounded-md bg-gray-100 px-1">
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
      <div className="rounded-lg bg-gray-900 px-4 py-3 text-white">
        <div>
          <p className="text-xs font-semibold text-yellow-300">예상 OPIc 등급</p>
          <p className="text-3xl font-black">{record.grade}</p>
        </div>
      </div>
    </div>
  );
}

function DetailBar({ label, value, max, suffix }: { label: string; value: number | null; max: number; suffix: string }) {
  const safeValue = value ?? 0;
  const percentage = Math.max(0, Math.min((safeValue / max) * 100, 100));

  return (
    <div className="grid min-h-12 grid-cols-[7rem_1fr_4.75rem] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
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
    <Card className="overflow-hidden border-2 border-gray-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.25fr]">
        <div className="bg-yellow-50 p-5">
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
          <GradeBars record={record} />
        </div>

        <div className="p-5">
          <p className="text-sm font-semibold text-gray-500">판정 근거</p>
          <p className="mt-1 text-base font-medium text-gray-900">{record.reason}</p>
          {record.feedback && <p className="mt-2 text-sm leading-6 text-gray-600">{record.feedback}</p>}
          <p className="mt-3 text-xs text-gray-500">
            채점 문항 {record.completedQuestions}/{record.totalQuestions}개 기준
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="mt-5 gap-2 border-yellow-300 text-gray-900 hover:bg-yellow-50"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            상세 정보
          </Button>

          {expanded && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
              <div className="grid gap-2">
                {detailMetricLabels.map((item) => {
                  const value = metricValue(record.metrics[item.key], item.percent);
                  return <DetailBar key={item.key} label={item.label} value={value} max={item.max} suffix={item.suffix} />;
                })}
              </div>

              <div className="grid gap-2 lg:grid-cols-2">
                {Object.entries(record.categoryScores).map(([key, value]) => (
                  <DetailBar key={key} label={scoreMetricLabels[key] || key} value={value} max={100} suffix="점" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
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
            <p className="text-gray-600">저장된 평가 결과만 모아 연습과 모의고사를 따로 확인하세요.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-white p-2 shadow-sm">
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

        {visibleRecords.length === 0 ? (
          <Card className="bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
              <BarChart3 className="h-7 w-7 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">아직 저장된 점수 기록이 없습니다</h2>
            <p className="mt-2 text-sm text-gray-600">
              결과 화면을 확인하면 예상 등급, 점수, 세부 지표가 자동으로 기록됩니다.
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
