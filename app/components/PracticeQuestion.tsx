import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronUp, HelpCircle, Lightbulb, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useQuestionSpeech } from "../hooks/useQuestionSpeech";
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

type HintWord = {
  word: string;
  meaning: string;
};

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

const hintWordMeanings: Record<string, string> = {
  activities: "활동",
  atmosphere: "분위기",
  benefits: "장점",
  cafe: "카페",
  destination: "목적지",
  enjoyment: "즐거움",
  exercise: "운동",
  favorite: "가장 좋아하는",
  feelings: "느낌",
  frequency: "빈도",
  menu: "메뉴",
  people: "사람들",
};

function parseHintWords(hint?: string): HintWord[] {
  if (!hint) {
    return [];
  }

  return hint
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.+?)\s*\((.+)\)$/);
      const word = match ? match[1].trim() : item;
      const meaning = match ? match[2].trim() : hintWordMeanings[word.toLowerCase()] || "뜻 확인";

      return {
        word,
        meaning,
      };
    });
}

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
  const [questionSpeechError, setQuestionSpeechError] = useState("");
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
  const {
    isSpeaking,
    progress: speechProgress,
    durationMs: speechDurationMs,
    isSupported: isQuestionSpeechSupported,
    speak,
    stop,
  } = useQuestionSpeech();

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

  useEffect(() => {
    setQuestionSpeechError("");
    stop();
  }, [currentQuestion, stop]);

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
  const hintWords = parseHintWords(currentQuestionItem?.hint);
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

  const handlePlayQuestion = () => {
    if (!canPlayQuestion || !currentQuestionItem?.text) {
      return;
    }

    if (!isQuestionSpeechSupported) {
      setQuestionSpeechError("이 브라우저에서는 문제 듣기 기능을 지원하지 않습니다.");
      return;
    }

    const didSpeak = speak(currentQuestionItem.text);
    if (!didSpeak) {
      setQuestionSpeechError("문제를 음성으로 읽지 못했습니다.");
      return;
    }

    setQuestionSpeechError("");
    setPlayCount((prev) => prev + 1);
  };

  const handleRecordingToggle = async () => {
    if (isBusy) {
      return;
    }

    if (!isRecording) {
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
          : "답변을 저장하고 있습니다...",
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

              <button
                type="button"
                onClick={handlePlayQuestion}
                disabled={isSpeaking || !canPlayQuestion}
                className="mx-auto flex h-8 w-full max-w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition disabled:cursor-default disabled:opacity-100"
                aria-label={playCount > 0 ? "문제 다시 듣기" : "문제 듣기"}
              >
                <div className={`flex w-8 items-center justify-center text-white ${!canPlayQuestion && !isSpeaking ? "bg-gray-300" : "bg-orange-500"}`}>
                  {playCount > 0 && !isSpeaking ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                </div>
                <div className="flex flex-1 items-center px-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gray-500 transition-[width] ease-linear"
                      style={{
                        width: `${isSpeaking ? speechProgress : 0}%`,
                        transitionDuration: isSpeaking ? `${speechDurationMs}ms` : "0ms",
                      }}
                    />
                  </div>
                </div>
              </button>
              <p className="mt-1 text-center text-xs text-gray-500">최대 2회 재생</p>
            </div>

            <div className="flex flex-col justify-start">
              <div className="mb-4 grid gap-3 sm:gap-3">
                <div
                  role={!showQuestion ? "button" : undefined}
                  tabIndex={!showQuestion ? 0 : undefined}
                  onClick={() => {
                    if (!showQuestion) {
                      setShowQuestion(true);
                      setShowTranslation(false);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!showQuestion && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      setShowQuestion(true);
                      setShowTranslation(false);
                    }
                  }}
                  className={`flex w-full items-center justify-center rounded-md border border-yellow-100 bg-yellow-50 px-2 text-center shadow-md transition hover:bg-yellow-100 hover:shadow-lg sm:rounded-xl sm:px-4 ${
                    showQuestion ? "min-h-[150px] py-3 sm:min-h-[180px]" : "min-h-[72px] py-2 sm:min-h-[84px]"
                  } ${
                    !showQuestion ? "cursor-pointer" : ""
                  }`}
                >
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
                          className="gap-2 border-yellow-300 bg-transparent text-yellow-900 hover:bg-yellow-100"
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

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowQuestion(false);
                          setShowTranslation(false);
                        }}
                        className="h-7 rounded-full border border-yellow-300 bg-white px-2.5 text-xs text-yellow-900 shadow-sm hover:bg-yellow-100"
                        aria-label="문제 닫기"
                      >
                        <ChevronUp className="h-4 w-4" />
                        닫기
                      </Button>
                    </motion.div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-yellow-900 sm:text-xl">
                      <HelpCircle className="h-4 w-4 shrink-0" />
                      문제 보기
                    </span>
                  )}
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!showHint) {
                      setShowHint(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!showHint && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      setShowHint(true);
                    }
                  }}
                  className={`flex w-full cursor-pointer items-center justify-center rounded-md border border-sky-100 bg-sky-50 px-3 text-center shadow-md transition hover:bg-sky-100 hover:shadow-lg sm:rounded-xl sm:px-4 ${
                    showHint ? "min-h-[92px] py-4 sm:min-h-[110px]" : "min-h-[58px] py-2 sm:min-h-[66px]"
                  }`}
                >
                  {showHint ? (
                    <motion.div
                      key={`hint-${currentQuestion}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex w-full flex-col items-center gap-3"
                    >
                      <div className="grid w-full grid-cols-2 gap-1.5 text-left sm:gap-2">
                        {hintWords.map((item) => (
                          <div
                            key={`${item.word}-${item.meaning}`}
                            className="grid min-h-10 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-1.5 rounded-md border border-sky-100 bg-white/60 px-2 py-1.5 shadow-sm sm:min-h-11 sm:gap-2 sm:px-3 sm:py-2"
                          >
                            <span className="min-w-0 whitespace-normal break-words text-[9px] font-semibold leading-tight text-gray-900 sm:text-[11px]">
                              {item.word}
                            </span>
                            <span className="min-w-0 break-keep text-right text-[9px] font-medium leading-tight text-gray-600 sm:text-[11px]">
                              {item.meaning}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setShowHint(false);
                        }}
                        className="h-7 rounded-full border border-sky-300 bg-white px-2.5 text-xs text-sky-900 shadow-sm hover:bg-sky-100"
                        aria-label="힌트 닫기"
                      >
                        <ChevronUp className="h-4 w-4" />
                        닫기
                      </Button>
                    </motion.div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-sky-900 sm:text-xl">
                      <Lightbulb className="h-4 w-4 shrink-0" />
                      단어 힌트
                    </span>
                  )}
                </div>
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
          {questionSpeechError && <p className="mb-4 text-center text-sm text-red-500">{questionSpeechError}</p>}

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
