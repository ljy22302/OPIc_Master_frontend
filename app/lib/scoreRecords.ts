import { type EvaluationMode, type EvaluationSession, type OpicMetricSnapshot } from "./evaluationApi";

export const scoreRecordsStorageKey = "opicScoreRecords";

const practiceRecordRetentionMs = 30 * 24 * 60 * 60 * 1000;

export type ScoreRecord = {
  id: string;
  sessionId: number;
  mode: EvaluationMode;
  title: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
  metrics: OpicMetricSnapshot;
  categoryScores: Record<string, number>;
};

function isExpiredPracticeRecord(record: ScoreRecord, now = Date.now()) {
  if (record.mode !== "practice") {
    return false;
  }

  const timestamp = new Date(record.updatedAt || record.createdAt).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return now - timestamp > practiceRecordRetentionMs;
}

function pruneExpiredPracticeRecords(records: ScoreRecord[]) {
  const now = Date.now();
  return records.filter((record) => !isExpiredPracticeRecord(record, now));
}

function readRecords(): ScoreRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(scoreRecordsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return pruneExpiredPracticeRecords(parsed as ScoreRecord[]);
  } catch {
    return [];
  }
}

function writeRecords(records: ScoreRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(scoreRecordsStorageKey, JSON.stringify(pruneExpiredPracticeRecords(records)));
}

export function getScoreRecords() {
  const records = readRecords().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  writeRecords(records);
  return records;
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
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    metrics: opic.metricSnapshot || {},
    categoryScores: session.overall.categoryScores || {},
  };

  const records = readRecords();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
  writeRecords(nextRecords);
}
