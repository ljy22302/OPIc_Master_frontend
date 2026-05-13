import { type EvaluationMode, type EvaluationSession, type OpicMetricSnapshot } from "./evaluationApi";

export const scoreRecordsStorageKey = "opicScoreRecords";

export type ScoreRecord = {
  id: string;
  sessionId: number;
  mode: EvaluationMode;
  title: string;
  grade: string;
  score100: number;
  reason: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
  completedQuestions: number;
  totalQuestions: number;
  metrics: OpicMetricSnapshot;
  categoryScores: Record<string, number>;
};

function readRecords(): ScoreRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(scoreRecordsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records: ScoreRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(scoreRecordsStorageKey, JSON.stringify(records));
}

export function getScoreRecords() {
  return readRecords().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function deleteScoreRecord(recordId: string) {
  writeRecords(readRecords().filter((record) => record.id !== recordId));
}

export function saveScoreRecordFromSession(session: EvaluationSession) {
  const opic = session.overall?.opic;

  if (!opic) {
    return;
  }

  const record: ScoreRecord = {
    id: `${session.mode}-${session.id}`,
    sessionId: session.id,
    mode: session.mode,
    title: session.mode === "mock_test" ? "모의고사 결과" : "연습 결과",
    grade: opic.grade || session.overall.estimatedGrade || "데이터 부족",
    score100: Number.isFinite(opic.score100) ? opic.score100 : 0,
    reason: opic.gradeReason || opic.summary || "판정 근거가 없습니다.",
    feedback: opic.mainFeedback || session.overall.feedback?.summary || "",
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    completedQuestions: session.completedQuestions,
    totalQuestions: session.totalQuestions,
    metrics: opic.metricSnapshot || {},
    categoryScores: session.overall.categoryScores || {},
  };

  const records = readRecords();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
  writeRecords(nextRecords);
}
