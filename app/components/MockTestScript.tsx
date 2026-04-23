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
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { mockTestQuestions } from "./mockTestQuestions";

type MockTestScriptState = {
  sessionId?: number;
  questionCount?: number;
  questionResults?: EvaluationAnswer[];
  difficulty?: string;
  currentStatus?: string;
  studentStatus?: string;
  livingSituation?: string;
  selectedLeisure?: string[];
  selectedHobbies?: string[];
  selectedExercises?: string[];
  selectedTravel?: string[];
};

export function MockTestScript() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const {
    sessionId: stateSessionId,
    questionCount = mockTestQuestions.length,
    questionResults: initialQuestionResults = [],
    difficulty = "",
    currentStatus = "",
    studentStatus = "",
    livingSituation = "",
    selectedLeisure = [],
    selectedHobbies = [],
    selectedExercises = [],
    selectedTravel = [],
  } = (location.state as MockTestScriptState) ?? {};

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
    () => mockTestQuestions.slice(0, questionCount),
    [questionCount],
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
        setPageError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load mock test answers.",
        );
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
      setPageError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save the edited transcript.",
      );
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

    const transitionDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const runTransition = async () => {
      try {
        setTransitionMessage("Finalizing your mock test result...");
        setTransitionPhase("saving");
        await transitionDelay(500);
        setTransitionPhase("preparing");
        setTransitionMessage("Preparing the feedback cards...");
        const sessionResult: EvaluationSession = await completeEvaluationSession(sessionId);
        await transitionDelay(500);
        navigate(`/mocktest/result?sessionId=${sessionId}`, {
          state: {
            sessionId,
            sessionResult,
            questionCount,
            difficulty,
            currentStatus,
            studentStatus,
            livingSituation,
            selectedLeisure,
            selectedHobbies,
            selectedExercises,
            selectedTravel,
          },
        });
      } catch (resultError) {
        setPageError(
          resultError instanceof Error
            ? resultError.message
            : "Failed to prepare the result page.",
        );
      } finally {
        setTransitionPhase(null);
        setTransitionMessage("");
      }
    };

    void runTransition();
  };

  const goBackToQuestion = () => {
    navigate("/mocktest/question", {
      state: {
        currentQuestion: Math.max(questionResults.length - 1, 0),
        questionResults,
        difficulty,
        currentStatus,
        studentStatus,
        livingSituation,
        selectedLeisure,
        selectedHobbies,
        selectedExercises,
        selectedTravel,
        sessionId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBackToQuestion}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold text-gray-600">Mock Test Script</div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-yellow-900">Mock Test Script</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">Review And Edit</h1>
              </div>
              <Button
                onClick={goResult}
                disabled={!sessionId || isLoading || isSavingEdit}
                className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
              >
                See Result
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {pageError && (
              <p className="mb-4 text-sm text-red-500">{pageError}</p>
            )}

            {isLoading ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-gray-500">
                Loading saved answers...
              </div>
            ) : (
              <div className="space-y-4">
                {visibleQuestions.map((question, index) => {
                  const answer = questionResults[index];
                  const transcript = answer?.usedTranscript?.trim() || "";
                  const isEditing = editingIndex === index;

                  return (
                    <Card key={question.id} className="border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                          Q{index + 1}. {answer?.questionText || question.text}
                        </h2>
                        {answer?.audioUrl ? (
                          <audio controls preload="none" src={answer.audioUrl} className="max-w-[260px]" />
                        ) : (
                          <span className="text-xs text-gray-400">No recording</span>
                        )}
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-medium text-gray-600">Transcript</p>

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={draftAnswer}
                              onChange={(event) => setDraftAnswer(event.target.value)}
                              className="min-h-32 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-800 outline-none focus:border-yellow-400"
                              placeholder="Edit the transcript and save to re-evaluate this answer."
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                className="gap-2"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={isSavingEdit}
                                onClick={() => void saveEdit(index)}
                                className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                              >
                                <Check className="h-4 w-4" />
                                Save And Re-evaluate
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="min-h-24 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                              {transcript || "No transcript is available for this answer yet."}
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
                                Edit Transcript
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
          <Button variant="outline" onClick={() => navigate("/mocktest/setup")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart Mock Test
          </Button>
          <Button
            onClick={goResult}
            disabled={!sessionId || isLoading || isSavingEdit}
            className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
          >
            Go To Result
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
            <p className="mt-3 text-center text-sm text-gray-600">Please wait a moment.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
