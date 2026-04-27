import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, HelpCircle, Lightbulb, Mic, Square, Volume2 } from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import {
  createEvaluationSession,
  uploadAnswerEvaluation,
  type EvaluationAnswer,
  type EvaluationQuestionPayload,
} from "../lib/evaluationApi";
import { type PracticeQuestionItem } from "../lib/practiceApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import ossCharacter from "./OSS_character.png";

type TransitionPhase = "saving" | "preparing" | null;
type TransitionAction = "next" | "result" | null;

type PracticeQuestionState = {
  difficultyLabel?: string;
  selectedType?: string;
  selectedTypeLabel?: string;
  selectedTopics?: string[];
  selectedTopicLabels?: string[];
  questionSetId?: number;
  questions?: PracticeQuestionItem[];
  currentQuestion?: number;
  questionResults?: EvaluationAnswer[];
  sessionId?: number;
};

export function PracticeQuestion() {
  const recordingLimit = 120;
  const navigate = useNavigate();
  const location = useLocation();

  const {
    difficultyLabel = "",
    selectedType = "",
    selectedTypeLabel = "",
    selectedTopics = [] as string[],
    selectedTopicLabels = [] as string[],
    questions = [] as PracticeQuestionItem[],
    currentQuestion: initialCurrentQuestion = 0,
    questionResults: initialQuestionResults = [] as EvaluationAnswer[],
    sessionId: initialSessionId,
  } = (location.state as PracticeQuestionState) ?? {};

  const visibleQuestions = useMemo(() => questions, [questions]);
  const questionLimit = visibleQuestions.length;

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    Math.min(initialCurrentQuestion, Math.max(questionLimit - 1, 0)),
  );
  const [timeLeft, setTimeLeft] = useState(recordingLimit);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(initialSessionId ?? null);
  const [sessionError, setSessionError] = useState("");
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionResults, setQuestionResults] = useState<EvaluationAnswer[]>(() => {
    const base = Array.from({ length: questionLimit }, () => null) as Array<EvaluationAnswer | null>;
    initialQuestionResults.forEach((item, index) => {
      if (index < base.length) {
        base[index] = item;
      }
    });
    return base.filter(Boolean) as EvaluationAnswer[];
  });

  const {
    error,
    isRecording,
    isUploading,
    lastRecording,
    resetRecording,
    startRecording,
    stopRecording,
  } = useSpeechToTextRecorder({
    questionId: `practice-${visibleQuestions[currentQuestion]?.id ?? currentQuestion + 1}`,
    language: "en",
  });

  useEffect(() => {
    let isMounted = true;

    if (sessionId || visibleQuestions.length === 0) {
      return undefined;
    }

    const payloadQuestions: EvaluationQuestionPayload[] = visibleQuestions.map((question, index) => ({
      questionId: `practice-${question.id}`,
      questionOrder: index + 1,
      questionText: question.text,
      questionType: selectedType || "practice",
      translation: question.translation,
      hint: question.hint,
      category: question.category,
    }));

    const run = async () => {
      try {
        setIsPreparingSession(true);
        setSessionError("");
        const session = await createEvaluationSession({
          mode: "practice",
          title: "Practice Session",
          difficulty: difficultyLabel || undefined,
          metadata: {
            difficultyLabel,
            selectedType,
            selectedTypeLabel,
            selectedTopics,
            selectedTopicLabels,
          },
          questions: payloadQuestions,
        });

        if (!isMounted) {
          return;
        }

        setSessionId(session.id);
        setQuestionResults(session.answers);
      } catch (sessionCreateError) {
        if (!isMounted) {
          return;
        }
        setSessionError(sessionCreateError instanceof Error ? sessionCreateError.message : "연습 세션 준비에 실패했습니다.");
      } finally {
        if (isMounted) {
          setIsPreparingSession(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [difficultyLabel, selectedTopicLabels, selectedTopics, selectedType, selectedTypeLabel, sessionId, visibleQuestions]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRecording, timeLeft]);

  const displayTypeText = useMemo(() => {
    if (!selectedTypeLabel) {
      return "";
    }

    if (selectedType === "topics" && selectedTopicLabels[0]) {
      return `${selectedTypeLabel} - ${selectedTopicLabels[0]}`;
    }

    return selectedTypeLabel;
  }, [selectedTopicLabels, selectedType, selectedTypeLabel]);

  const currentQuestionItem = visibleQuestions[currentQuestion];
  const currentSavedResult = questionResults[currentQuestion];
  const isBusy = isUploading || isEvaluating || isPreparingSession;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.abs(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatRecordingTime = (seconds: number) => {
    if (seconds >= 0) {
      return formatTime(seconds);
    }

    return `+${formatTime(Math.abs(seconds))}`;
  };

  const recordingProgress = Math.min(
    ((recordingLimit - Math.max(timeLeft, 0)) / recordingLimit) * 100,
    100,
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(timeLeft, 0)) / recordingLimit) * 100,
    100,
  );
  const isOvertime = timeLeft < 0;
  const canPlayQuestion = playCount < 2;

  const handleRecordingToggle = async () => {
    if (isBusy) {
      return;
    }

    if (!isRecording) {
      setTimeLeft(recordingLimit);
      resetRecording();
      await startRecording();
      return;
    }

    await stopRecording();
  };

  const handleNext = async () => {
    if (transitionPhase || isBusy || !currentQuestionItem || !sessionId) {
      return;
    }

    const nextAction: TransitionAction = currentQuestion < visibleQuestions.length - 1 ? "next" : "result";

    try {
      setTransitionMessage(
        nextAction === "result"
          ? "최종 결과를 준비하고 있습니다..."
          : "답변을 저장하고 평가하고 있습니다...",
      );
      setTransitionPhase("saving");
      setIsEvaluating(true);

      const recording = isRecording ? await stopRecording() : lastRecording;
      const evaluation = await uploadAnswerEvaluation({
        sessionId,
        mode: "practice",
        questionId: `practice-${currentQuestionItem.id}`,
        questionOrder: currentQuestion + 1,
        questionText: currentQuestionItem.text,
        questionType: selectedType || "practice",
        clientDurationSeconds: recording?.durationSeconds || 0,
        audioBlob: recording?.audioBlob || null,
        fileName: recording?.fileName,
      });

      const nextResults = Array.from({ length: visibleQuestions.length }, (_, index) => questionResults[index] || null);
      nextResults[currentQuestion] = evaluation;
      setQuestionResults(nextResults.filter(Boolean) as EvaluationAnswer[]);

      const transitionDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await transitionDelay(800);

      if (nextAction === "next") {
        setTransitionPhase("preparing");
        setTransitionMessage("다음 문제로 이동 중입니다...");
        await transitionDelay(700);
        setCurrentQuestion((prev) => prev + 1);
        setTimeLeft(recordingLimit);
        setShowQuestion(false);
        setShowTranslation(false);
        setShowHint(false);
        setPlayCount(0);
        resetRecording();
      } else {
        navigate(`/practice/script?sessionId=${sessionId}`, {
          state: {
            sessionId,
            questionCount: visibleQuestions.length,
            selectedType,
            difficultyLabel,
            selectedTypeLabel,
            selectedTopics,
            selectedTopicLabels,
            questions: visibleQuestions,
            questionResults: nextResults.filter(Boolean),
          },
        });
      }
    } catch (evaluationError) {
      setSessionError(evaluationError instanceof Error ? evaluationError.message : "답변 평가에 실패했습니다.");
    } finally {
      setIsEvaluating(false);
      setTransitionPhase(null);
      setTransitionMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/practice/setup")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600">
              질문 {currentQuestion + 1} / {visibleQuestions.length || questionLimit}
            </span>
          </div>
        </div>

        {(difficultyLabel || displayTypeText) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {difficultyLabel && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {difficultyLabel}
                </span>
              )}
              {displayTypeText && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {displayTypeText}
                </span>
              )}
            </div>
          </motion.div>
        )}

        <Card className="border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 flex w-full max-w-[320px] justify-center">
                <div className="relative z-10 mt-3 inline-flex w-[250px] rounded-[28px] border border-yellow-200 bg-white p-3 shadow-md">
                  <div className="flex h-[214px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-white p-2">
                    <img
                      src={ossCharacter}
                      alt="OSS_character"
                      className="h-full w-full rounded-[18px] object-contain object-center"
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (canPlayQuestion) {
                    setPlayCount((prev) => prev + 1);
                  }
                }}
                disabled={!canPlayQuestion}
                className="mx-auto gap-2 text-gray-700 disabled:opacity-40"
              >
                <Volume2 className="h-4 w-4" />
                문제 듣기
              </Button>
              <p className="mt-1 text-center text-xs text-gray-500">최대 2회 재생</p>
            </div>

            <div className="flex flex-col justify-start">
              <div className="mb-4 grid h-[210px] gap-3 sm:h-[300px] sm:grid-rows-[3fr_2fr] sm:gap-3">
                <div className="flex h-full w-full items-center justify-center rounded-md border border-yellow-100 bg-yellow-50 px-2 py-3 text-center shadow-md transition hover:bg-yellow-100 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-0">
                  {showQuestion ? (
                    <motion.div
                      key={`question-${currentQuestion}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex h-full w-full flex-col items-center justify-center gap-3"
                    >
                      <p className="text-center text-base font-medium leading-snug text-gray-900 sm:text-lg sm:leading-relaxed">
                        {currentQuestionItem?.text}
                      </p>

                      {!showTranslation && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTranslation(true)}
                          className="gap-2 border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100"
                        >
                          <HelpCircle className="h-4 w-4 shrink-0" />
                          해석 보기
                        </Button>
                      )}

                      {showTranslation && (
                        <motion.p
                          key={`translation-${currentQuestion}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-[32rem] text-center text-sm font-medium leading-relaxed text-gray-700 sm:text-base"
                        >
                          {currentQuestionItem?.translation}
                        </motion.p>
                      )}
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuestion(true);
                        setShowTranslation(false);
                      }}
                      className="inline-flex items-center gap-2 text-base font-semibold text-yellow-900 sm:text-2xl"
                    >
                      <HelpCircle className="h-4 w-4 shrink-0" />
                      문제 보기
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => setShowHint((prev) => !prev)} className="h-full w-full">
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-sky-100 bg-sky-50 px-2 py-3 text-center shadow-md transition hover:bg-sky-100 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-0">
                    {showHint ? (
                      <motion.div
                        key={`hint-${currentQuestion}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                      >
                        <p className="text-base font-medium leading-snug text-gray-700 sm:text-lg sm:leading-relaxed">
                          {currentQuestionItem?.hint}
                        </p>
                      </motion.div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-sky-900 sm:text-2xl">
                        <Lightbulb className="h-4 w-4 shrink-0" />
                        단어 힌트
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 mt-6 bg-white p-6">
          <div className="mb-4 flex justify-center">
            <Button
              size="lg"
              onClick={handleRecordingToggle}
              disabled={isBusy || !sessionId}
              className="gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isRecording ? "녹음 종료" : "녹음 시작"}
            </Button>
          </div>

          {isPreparingSession && <p className="mb-4 text-center text-sm text-gray-500">연습 세션 준비 중...</p>}
          {isEvaluating && <p className="mb-4 text-center text-sm text-gray-500">답변 업로드 및 평가 중...</p>}
          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          {sessionError && <p className="mb-4 text-center text-sm text-red-500">{sessionError}</p>}

          {currentSavedResult?.usedTranscript && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              방금 저장한 스크립트: {currentSavedResult.usedTranscript}
            </div>
          )}

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">녹음 시간</span>
              <span className={`font-semibold ${isOvertime || timeLeft < 30 ? "text-red-500" : "text-gray-900"}`}>
                {formatRecordingTime(timeLeft)}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-yellow-400 transition-[width] ease-linear"
                style={{ width: `${recordingProgress}%`, transitionDuration: "1000ms" }}
              />
              {isOvertime && (
                <div
                  className="absolute inset-y-0 left-0 bg-red-500 transition-[width] ease-linear"
                  style={{ width: `${overtimeProgress}%`, transitionDuration: "1000ms" }}
                />
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={handleNext}
            disabled={!!transitionPhase || isBusy || !sessionId}
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
          >
            {currentQuestion < visibleQuestions.length - 1 ? "다음 문제" : "결과 보기"}
          </Button>
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
              <p className="mt-3 text-center text-sm text-gray-600">잠시만 기다려 주세요.</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
