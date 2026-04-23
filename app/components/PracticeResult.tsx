import { useLocation, useNavigate } from "react-router";
import { type EvaluationSession } from "../lib/evaluationApi";
import { EvaluationResultView } from "./EvaluationResultView";

type PracticeResultState = {
  sessionId?: number;
  sessionResult?: EvaluationSession;
};

export function PracticeResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { sessionId: stateSessionId, sessionResult } = (location.state as PracticeResultState) ?? {};
  const querySessionId = Number(query.get("sessionId") || 0);
  const sessionId = stateSessionId ?? (querySessionId || null);

  return (
    <EvaluationResultView
      sessionId={sessionId}
      initialSessionResult={sessionResult}
      title="Practice Complete"
      subtitle="Your answer transcripts, metrics, and feedback are now loaded from the backend."
      restartPath="/practice/setup"
      showPracticeNotice
      onNavigate={(path) => navigate(path)}
    />
  );
}
