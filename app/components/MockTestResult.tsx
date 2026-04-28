import { useLocation, useNavigate } from "react-router";
import { type EvaluationSession } from "../lib/evaluationApi";
import { EvaluationResultView } from "./EvaluationResultView";

type MockTestResultState = {
  sessionId?: number;
  sessionResult?: EvaluationSession;
};

export function MockTestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { sessionId: stateSessionId, sessionResult } = (location.state as MockTestResultState) ?? {};
  const querySessionId = Number(query.get("sessionId") || 0);
  const sessionId = stateSessionId ?? (querySessionId || null);

  return (
    <EvaluationResultView
      sessionId={sessionId}
      initialSessionResult={sessionResult}
      title="모의고사 완료"
      subtitle="문항별 답변 스크립트와 평가 결과를 확인해보세요."
      restartPath="/mocktest/setup"
      onNavigate={(path) => navigate(path)}
    />
  );
}
