import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Check, ChevronRight, PencilLine, RotateCcw, X } from "lucide-react";
import {
  completeEvaluationSession,
  getEvaluationSessionResult,
  reEvaluateAnswer,
  updateAnswerTranscript,
  type EvaluationAnswer,
  type EvaluationSession,
} from "../lib/evaluationApi";
import { type PracticeQuestionItem } from "../lib/practiceApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type PracticeScriptState = {
  sessionId?: number;
  questionCount?: number;
  questionResults?: EvaluationAnswer[];
  selectedType?: string;
  difficultyLabel?: string;
  selectedTypeLabel?: string;
  selectedTopics?: string[];
  selectedTopicLabels?: string[];
  questions?: PracticeQuestionItem[];
};

export function PracticeScript() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const {
    sessionId: stateSessionId,
    questionCount = 0,
    questionResults: initialQuestionResults = [],
    selectedType = "",
    difficultyLabel = "",
    selectedTypeLabel = "",
    selectedTopics = [],
    selectedTopicLabels = [],
    questions = [],
  } = (location.state as PracticeScriptState) ?? {};

  const querySessionId = Number(query.get("sessionId") || 0);
  const sessionId = stateSessionId ?? (querySessionId || null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [questionResults, setQuestionResults] = useState<EvaluationAnswer[]>(initialQuestionResults);
  const [transitionPhase, setTransitionPhase] = useState<"saving" | "preparing" | null>(null);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(initialQuestionResults.length === 0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const visibleQuestions = useMemo(
    () => (questionCount > 0 ? questions.slice(0, questionCount) : questions),
    [questionCount, questions],
  );

  useEffect(() => {
    let isMounted = true;

    if (!sessionId || initialQuestionResults.length > 0) {
      setIsLoading(false);
      return undefined;
    }

    const run = async () => {
      try {
        setIsLoading(true);
        const session = await getEvaluationSessionResult(sessionId);
        if (!isMounted) {
          return;
        }
        setQuestionResults(session.answers);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setPageError(loadError instanceof Error ? loadError.message : "?곗뒿 ?듬???遺덈윭?ㅼ? 紐삵뻽?듬땲??");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [initialQuestionResults.length, sessionId]);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraftAnswer(questionResults[index]?.usedTranscript || "");
  };

  const saveEdit = async (index: number) => {
    const answer = questionResults[index];
    if (!answer) {
      return;
    }

    try {
      setIsSavingEdit(true);
      setPageError("");
      await updateAnswerTranscript(answer.id, draftAnswer);
      const refreshedAnswer = await reEvaluateAnswer(answer.id);
      const nextResults = [...questionResults];
      nextResults[index] = refreshedAnswer;
      setQuestionResults(nextResults);
      setEditingIndex(null);
      setDraftAnswer("");
    } catch (saveError) {
      setPageError(saveError instanceof Error ? saveError.message : "?섏젙???ㅽ겕由쏀듃瑜???ν븯吏 紐삵뻽?듬땲??");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraftAnswer("");
  };

  const goResult = () => {
    if (transitionPhase || !sessionId) {
      return;
    }

    const transitionDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const runTransition = async () => {
      try {
        setTransitionMessage("?곗뒿 寃곌낵瑜?留덈Т由ы븯怨??덉뒿?덈떎...");
        setTransitionPhase("saving");
        await transitionDelay(500);
        setTransitionPhase("preparing");
        setTransitionMessage("?쇰뱶諛??붾㈃??以鍮꾪븯怨??덉뒿?덈떎...");
        const sessionResult: EvaluationSession = await completeEvaluationSession(sessionId);
        await transitionDelay(500);
        navigate(`/practice/result?sessionId=${sessionId}`, {
          state: {
            sessionId,
            sessionResult,
            questionCount,
            selectedType,
            difficultyLabel,
            selectedTypeLabel,
            selectedTopics,
            selectedTopicLabels,
          },
        });
      } catch (resultError) {
        setPageError(resultError instanceof Error ? resultError.message : "寃곌낵 ?붾㈃??以鍮꾪븯吏 紐삵뻽?듬땲??");
      } finally {
        setTransitionPhase(null);
        setTransitionMessage("");
      }
    };

    void runTransition();
  };

  const goBackToQuestion = () => {
    navigate("/practice/question", {
      state: {
        currentQuestion: Math.max(questionResults.length - 1, 0),
        questionResults,
        questionCount,
        selectedType,
        difficultyLabel,
        selectedTypeLabel,
        selectedTopics,
        selectedTopicLabels,
        questions: visibleQuestions,
        sessionId,
      },
    });
  };

  const questionCards = visibleQuestions.length > 0
    ? visibleQuestions.map((question, index) => ({
        key: question.id,
        text: question.text,
        index,
      }))
    : questionResults.map((answer, index) => ({
        key: answer.questionId,
        text: answer.questionText,
        index,
      }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBackToQuestion}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold text-gray-600">?듬? ?ㅽ겕由쏀듃</div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-yellow-900">?듬? ?ㅽ겕由쏀듃</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">寃??諛??섏젙</h1>
              </div>
              <Button
                onClick={goResult}
                disabled={!sessionId || isLoading || isSavingEdit}
                className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
              >
                寃곌낵 蹂닿린
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {pageError && <p className="mb-4 text-sm text-red-500">{pageError}</p>}

            {isLoading ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-gray-500">
                ??λ맂 ?듬???遺덈윭?ㅻ뒗 以?..
              </div>
            ) : (
              <div className="space-y-4">
                {questionCards.map(({ key, text, index }) => {
                  const answer = questionResults[index];
                  const transcript = answer?.usedTranscript?.trim() || "";
                  const isEditing = editingIndex === index;

                  return (
                    <Card key={key} className="border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                          Q{index + 1}. {answer?.questionText || text}
                        </h2>
                        {answer?.audioUrl ? (
                          <audio controls preload="none" src={answer.audioUrl} className="max-w-[260px]" />
                        ) : (
                          <span className="text-xs text-gray-400">?뱀쓬 ?뚯씪 ?놁쓬</span>
                        )}
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-medium text-gray-600">?ㅽ겕由쏀듃</p>

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={draftAnswer}
                              onChange={(event) => setDraftAnswer(event.target.value)}
                              className="min-h-32 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-800 outline-none focus:border-yellow-400"
                              placeholder="?ㅽ겕由쏀듃瑜??섏젙??????ν븯硫????듬?留??ㅼ떆 ?됯??⑸땲??"
                            />
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} className="gap-2">
                                <X className="h-4 w-4" />
                                痍⑥냼
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={isSavingEdit}
                                onClick={() => void saveEdit(index)}
                                className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                              >
                                <Check className="h-4 w-4" />
                                ??????ы룊媛
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="min-h-24 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                              {transcript || "?꾩쭅 ??λ맂 ?ㅽ겕由쏀듃媛 ?놁뒿?덈떎."}
                            </p>

                            <div className="mt-4 flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!answer}
                                onClick={() => startEdit(index)}
                                className="gap-2"
                              >
                                <PencilLine className="h-4 w-4" />
                                ?ㅽ겕由쏀듃 ?섏젙
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" onClick={() => navigate("/practice/setup")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            泥섏쓬遺???ㅼ떆 ?섍린
          </Button>
          <Button
            onClick={goResult}
            disabled={!sessionId || isLoading || isSavingEdit}
            className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
          >
            寃곌낵 ?붾㈃?쇰줈 ?대룞
          </Button>
        </div>
      </div>

      {transitionPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-yellow-200 bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            </div>
            <p className="text-center text-2xl font-bold text-gray-900">{transitionMessage}</p>
            <p className="mt-3 text-center text-sm text-gray-600">?좎떆留?湲곕떎?ㅼ＜?몄슂.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
