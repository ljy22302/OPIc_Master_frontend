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
      subtitle="저장된 실제 평가 결과를 기반으로 문항별 피드백을 확인해보세요."
      restartPath="/mocktest/setup"
      onNavigate={(path) => navigate(path)}
    />
  );
}
