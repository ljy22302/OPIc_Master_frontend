import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronUp, HelpCircle, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useQuestionSpeech } from "../hooks/useQuestionSpeech";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import {
  createEvaluationSession,
  uploadAnswerEvaluation,
  type EvaluationAnswer,
  type EvaluationQuestionPayload,
} from "../lib/evaluationApi";
import { createMockTestSession, type MockTestQuestionItem } from "../lib/mockTestApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import ossCharacter from "./OSS_character.png";

type TransitionPhase = "saving" | "preparing" | null;
type TransitionAction = "next" | "script" | null;

type MockTestQuestionState = {
  difficulty?: string;
  currentStatus?: string;
  studentStatus?: string;
  livingSituation?: string;
  selectedLeisure?: string[];
  selectedHobbies?: string[];
  selectedExercises?: string[];
  selectedTravel?: string[];
  currentQuestion?: number;
  questionResults?: EvaluationAnswer[];
  sessionId?: number;
  mockTestQuestions?: MockTestQuestionItem[];
};

type QuestionResultsState = Array<EvaluationAnswer | null>;

export function MockTestQuestion() {
  const recordingLimit = 120;
  const navigate = useNavigate();
  const location = useLocation();

  const {
    difficulty = "",
    currentStatus = "",
    studentStatus = "",
    livingSituation = "",
    selectedLeisure = [],
    selectedHobbies = [],
    selectedExercises = [],
    selectedTravel = [],
    currentQuestion: initialCurrentQuestion = 0,
    questionResults: initialQuestionResults = [] as EvaluationAnswer[],
    sessionId: initialSessionId,
    mockTestQuestions: initialMockTestQuestions = [] as MockTestQuestionItem[],
  } = (location.state as MockTestQuestionState) ?? {};
  const buildQuestionResultsState = (items: EvaluationAnswer[], totalLength = initialMockTestQuestions.length || items.length || 0): QuestionResultsState => {
    const base = Array.from({ length: totalLength }, () => null) as QuestionResultsState;
    items.forEach((item, index) => {
      if (index < base.length) {
        base[index] = item;
      }
    });
    return base;
  };
  const isMountedRef = useRef(true);

  const [mockTestQuestions, setMockTestQuestions] = useState<MockTestQuestionItem[]>(initialMockTestQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(initialCurrentQuestion);
  const [totalTime, setTotalTime] = useState(2400);
  const [recordingTime, setRecordingTime] = useState(recordingLimit);
  const [playCount, setPlayCount] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(initialSessionId ?? null);
  const [sessionError, setSessionError] = useState("");
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionSpeechError, setQuestionSpeechError] = useState("");
  const [interactionNotice, setInteractionNotice] = useState("");
  const [pendingUploadCount, setPendingUploadCount] = useState(0);
  const [questionResults, setQuestionResults] = useState<QuestionResultsState>(() => buildQuestionResultsState(initialQuestionResults));
  const questionResultsRef = useRef<QuestionResultsState>(buildQuestionResultsState(initialQuestionResults));
  const queuedUploadPromisesRef = useRef<Array<Promise<EvaluationAnswer>>>([]);

  const questionCount = mockTestQuestions.length;
  const currentQ = mockTestQuestions[currentQuestion];

  const {
    error,
    isRecording,
    isUploading,
    lastRecording,
    resetRecording,
    startRecording,
    stopRecording,
  } = useSpeechToTextRecorder({
    questionId: `mock-test-${currentQ?.id ?? currentQuestion + 1}`,
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
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (sessionId || initialMockTestQuestions.length > 0) {
      return undefined;
    }

    const run = async () => {
      try {
        setIsPreparingSession(true);
        setSessionError("");

        const mockSession = await createMockTestSession({
          difficulty,
          currentStatus,
          studentStatus,
          livingSituation,
          selectedLeisure,
          selectedHobbies,
          selectedExercises,
          selectedTravel,
        });

        const payloadQuestions: EvaluationQuestionPayload[] = mockSession.questions.map((question) => ({
          questionId: `mock-test-${question.id}`,
          questionOrder: question.questionOrder,
          questionText: question.questionText,
          questionType: question.questionType,
          translation: question.translation,
          hint: question.hint,
          category: question.category || question.questionType,
        }));

        const session = await createEvaluationSession({
          mode: "mock_test",
          title: "Mock Test Session",
          difficulty: difficulty || undefined,
          metadata: {
            mockTestSessionId: mockSession.sessionId,
            difficulty,
            currentStatus,
            studentStatus,
            livingSituation,
            selectedLeisure,
            selectedHobbies,
            selectedExercises,
            selectedTravel,
          },
          questions: payloadQuestions,
        });

        if (!isMounted) {
          return;
        }

        setMockTestQuestions(mockSession.questions);
        setCurrentQuestion(Math.min(initialCurrentQuestion, Math.max(mockSession.questions.length - 1, 0)));
        setSessionId(session.id);
        const nextResults = buildQuestionResultsState(session.answers, mockSession.questions.length);
        questionResultsRef.current = nextResults;
        setQuestionResults(nextResults);
      } catch (sessionCreateError) {
        if (!isMounted) {
          return;
        }
        setSessionError(
          sessionCreateError instanceof Error
            ? sessionCreateError.message
            : "紐⑥쓽怨좎궗 ?몄뀡 以鍮꾩뿉 ?ㅽ뙣?덉뒿?덈떎.",
        );
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
  }, [
    currentStatus,
    difficulty,
    initialCurrentQuestion,
    initialMockTestQuestions.length,
    livingSituation,
    selectedExercises,
    selectedHobbies,
    selectedLeisure,
    selectedTravel,
    sessionId,
    studentStatus,
  ]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setTimeout(() => setRecordingTime((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRecording, recordingTime]);

  useEffect(() => {
    setQuestionSpeechError("");
    setInteractionNotice("");
    stop();
  }, [currentQuestion, stop]);

  useEffect(() => {
    if (!interactionNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setInteractionNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [interactionNotice]);

  useEffect(() => {
    if (totalTime > 0) {
      const timer = setTimeout(() => setTotalTime((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [totalTime]);

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

  const totalProgress = questionCount > 0 ? ((currentQuestion + 1) / questionCount) * 100 : 0;
  const recordingProgress = Math.min(
    ((recordingLimit - Math.max(recordingTime, 0)) / recordingLimit) * 100,
    100,
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(recordingTime, 0)) / recordingLimit) * 100,
    100,
  );
  const isOvertime = recordingTime < 0;
  const progressSteps = Array.from({ length: questionCount }, (_, index) => index + 1);
  const currentSavedResult = questionResults[currentQuestion];
  const isBusy = isUploading || isEvaluating || isPreparingSession;
  const isPlayBlockedByRecording = isRecording;
  const isRecordBlockedBySpeaking = isSpeaking;
  const updateQuestionResult = (questionIndex: number, evaluation: EvaluationAnswer) => {
    const nextResults = [...questionResultsRef.current];
    nextResults[questionIndex] = evaluation;
    questionResultsRef.current = nextResults;
    if (isMountedRef.current) {
      setQuestionResults(nextResults);
    }
  };
  const queueEvaluationUpload = (
    questionIndex: number,
    question: MockTestQuestionItem,
    recording = lastRecording,
  ) => {
    if (!sessionId) {
      throw new Error("?됯? ?몄뀡??李얠쓣 ???놁뒿?덈떎.");
    }

    if (isMountedRef.current) {
      setPendingUploadCount((prev) => prev + 1);
    }

    const uploadPromise = uploadAnswerEvaluation({
      sessionId,
      mode: "mock_test",
      questionId: `mock-test-${question.id}`,
      questionOrder: questionIndex + 1,
      questionText: question.questionText,
      questionType: question.questionType,
      clientDurationSeconds: recording?.durationSeconds || 0,
      audioBlob: recording?.audioBlob || null,
      fileName: recording?.fileName,
      clientTranscript: recording?.clientTranscript,
    })
      .then((evaluation) => {
        updateQuestionResult(questionIndex, evaluation);
        return evaluation;
      })
      .catch((uploadError) => {
        const message = uploadError instanceof Error ? uploadError.message : "?듬? ?됯????ㅽ뙣?덉뒿?덈떎.";
        if (isMountedRef.current) {
          setSessionError(message);
        }
        throw uploadError;
      })
      .finally(() => {
        if (isMountedRef.current) {
          setPendingUploadCount((prev) => Math.max(prev - 1, 0));
        }
      });

    queuedUploadPromisesRef.current = [...queuedUploadPromisesRef.current, uploadPromise];
    return uploadPromise;
  };
  const getCompletedQuestionResults = () =>
    questionResultsRef.current.filter((item): item is EvaluationAnswer => Boolean(item));

  const difficultyLabel = difficulty === "3-4" ? "?덈꺼 3-4" : difficulty === "5-6" ? "?덈꺼 5-6" : "";

  const handlePlayQuestion = () => {
    if (playCount >= 2 || !currentQ?.questionText) {
      return;
    }

    if (isPlayBlockedByRecording) {
      setInteractionNotice("?뱀쓬 以묒뿉??臾몄젣 ?ｊ린瑜??④퍡 ?ㅽ뻾?????놁뼱?? 癒쇱? ?뱀쓬??醫낅즺??二쇱꽭??");
      return;
    }

    if (!isQuestionSpeechSupported) {
      setQuestionSpeechError("??釉뚮씪?곗??먯꽌??臾몄젣 ?ｊ린 湲곕뒫??吏?먰븯吏 ?딆뒿?덈떎.");
      return;
    }

    const didSpeak = speak(currentQ.questionText);
    if (!didSpeak) {
      setQuestionSpeechError("臾몄젣瑜??뚯꽦?쇰줈 ?쎌? 紐삵뻽?듬땲??");
      return;
    }

    setQuestionSpeechError("");
    setPlayCount((prev) => prev + 1);
  };

  const handleRecordingToggle = async () => {
    if (isBusy) {
      return;
    }

    if (!isRecording && isRecordBlockedBySpeaking) {
      setInteractionNotice("臾몄젣 ?ｊ린 以묒뿉???뱀쓬???④퍡 ?ㅽ뻾?????놁뼱?? 臾몄젣 ?ｊ린媛 ?앸궃 ???ㅼ떆 ?쒕룄??二쇱꽭??");
      return;
    }

    if (!isRecording) {
      await startRecording();
      return;
    }

    await stopRecording();
  };

  const handleNext = async () => {
    if (transitionPhase || isBusy || !sessionId || !currentQ) {
      return;
    }

    const nextAction: TransitionAction = currentQuestion < questionCount - 1 ? "next" : "script";

    try {
      setTransitionMessage(
        nextAction === "script"
          ? "?ㅽ겕由쏀듃 ?붾㈃??以鍮꾪븯怨??덉뒿?덈떎..."
          : "?듬?????ν븯怨??됯??섍퀬 ?덉뒿?덈떎...",
      );
      const recording = isRecording ? await stopRecording() : lastRecording;
      setSessionError("");
      queueEvaluationUpload(currentQuestion, currentQ, recording);

      if (nextAction === "next") {
        setTransitionPhase("preparing");
        setTransitionMessage("?? ??? ?? ????...");
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        setCurrentQuestion((prev) => prev + 1);
        setRecordingTime(recordingLimit);
        setPlayCount(0);
        setShowQuestion(false);
        setShowTranslation(false);
        resetRecording();
      } else {
        setTransitionMessage("결과 화면으로 이동중입니다...");
        setTransitionPhase("saving");
        setIsEvaluating(true);
        await Promise.all(queuedUploadPromisesRef.current);

        const completedResults = getCompletedQuestionResults();
        if (completedResults.length < questionCount) {
          throw new Error("?쇰? ?듬? ??μ씠 ?꾩쭅 ?앸굹吏 ?딆븯?듬땲?? ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??");
        }

        navigate(`/mocktest/script?sessionId=${sessionId}`, {
          state: {
            sessionId,
            questionCount,
            mockTestQuestions,
            questionResults: completedResults,
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
      }
    } catch (evaluationError) {
      setSessionError(
        evaluationError instanceof Error
          ? evaluationError.message
          : "?듬? ?됯????ㅽ뙣?덉뒿?덈떎.",
      );
    } finally {
      setIsEvaluating(false);
      setTransitionPhase(null);
      setTransitionMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm("紐⑥쓽怨좎궗瑜??섍??쒓쿋?듬땲源? 吏湲덇퉴吏 吏꾪뻾???댁슜? ??λ릺吏 ?딆쓣 ???덉뒿?덈떎.")) {
                  navigate("/mocktest/setup");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">臾명빆</p>
                <p className="text-sm font-bold text-gray-900">
                  {questionCount > 0 ? currentQuestion + 1 : 0} / {questionCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">?꾩껜 ?쒓컙</p>
                <p className="text-sm font-bold text-gray-900">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {difficultyLabel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                {difficultyLabel}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          key={`question-${currentQuestion}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col items-center">
                <div className="mb-4 w-full max-w-[360px] rounded-[32px] border border-yellow-200 bg-white p-2 shadow-sm">
                  <div className="flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white">
                    <img src={ossCharacter} alt="질문 캐릭터" className="h-full w-full object-contain" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlayQuestion}
                  disabled={playCount >= 2 || !currentQ}
                  aria-disabled={isPlayBlockedByRecording}
                  className={`flex h-8 w-full max-w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition disabled:cursor-default disabled:opacity-100 ${
                    isPlayBlockedByRecording ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  aria-label={playCount > 0 ? "臾몄젣 ?ㅼ떆 ?ｊ린" : "臾몄젣 ?ｊ린"}
                >
                  <div className={`flex w-8 items-center justify-center text-white ${playCount >= 2 && !isSpeaking ? "bg-gray-300" : "bg-orange-500"}`}>
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
                <p className="mt-1 text-center text-xs text-gray-500">理쒕? 2???ъ깮</p>
              </div>

              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-10">
                  {progressSteps.map((step) => {
                    const isCurrent = step === currentQuestion + 1;
                    return (
                      <div
                        key={step}
                        className={`flex h-7 items-center justify-center rounded-sm border text-[11px] font-semibold sm:h-8 sm:text-xs ${
                          isCurrent ? "border-black bg-black text-white" : "border-gray-200 bg-gray-200 text-white"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
                {showQuestion ? (
                  <motion.div
                    key={`question-${currentQuestion}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex w-full flex-col items-center gap-3"
                  >
                    <p className="text-center text-lg font-medium leading-relaxed text-gray-900">
                      {currentQ?.questionText || "臾몄젣瑜?遺덈윭?ㅻ뒗 以묒엯?덈떎."}
                    </p>

                    {!showTranslation && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTranslation(true)}
                        className="gap-2 border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100"
                      >
                        ?댁꽍 蹂닿린
                      </Button>
                    )}

                    {showTranslation && (
                      <motion.p
                        key={`translation-${currentQuestion}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[36rem] text-center text-sm font-medium leading-relaxed text-gray-700"
                      >
                        {currentQ?.translation || "?댁꽍???깅줉?섏? ?딆? 臾몄젣?낅땲??"}
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
                      aria-label="臾몄젣 ?リ린"
                    >
                      <ChevronUp className="h-4 w-4" />
                      ?リ린
                    </Button>
                  </motion.div>
                ) : (
                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!currentQ}
                      onClick={() => {
                        setShowQuestion(true);
                        setShowTranslation(false);
                      }}
                      className="min-h-[72px] w-full gap-2 border-yellow-100 bg-yellow-50 text-base font-semibold text-yellow-900 shadow-md hover:bg-yellow-100 hover:shadow-lg disabled:bg-yellow-50 sm:min-h-[84px] sm:text-xl"
                    >
                      <HelpCircle className="h-4 w-4 shrink-0" />
                      臾몄젣 蹂닿린
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={handleRecordingToggle}
              disabled={isBusy || !sessionId || !currentQ}
              aria-disabled={isRecordBlockedBySpeaking}
              className={`gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70 ${
                isRecordBlockedBySpeaking ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isRecording ? "?뱀쓬 醫낅즺" : "?뱀쓬 ?쒖옉"}
            </Button>
          </div>

          {isPreparingSession && (
            <p className="mb-4 text-center text-sm text-gray-500">?좏깮 ?뺣낫瑜?諛뷀깢?쇰줈 紐⑥쓽怨좎궗 臾몄젣瑜?以鍮?以묒엯?덈떎...</p>
          )}

          {isEvaluating && (
            <p className="mb-4 text-center text-sm text-gray-500">?듬? ?낅줈??諛??됯? 以?..</p>
          )}

          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          {sessionError && <p className="mb-4 text-center text-sm text-red-500">{sessionError}</p>}
          {questionSpeechError && <p className="mb-4 text-center text-sm text-red-500">{questionSpeechError}</p>}
          {interactionNotice && (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              {interactionNotice}
            </p>
          )}

          {currentSavedResult?.usedTranscript && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              諛⑷툑 ??ν븳 ?ㅽ겕由쏀듃: {currentSavedResult.usedTranscript}
            </div>
          )}

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">?뱀쓬 ?쒓컙</span>
              <span className={`font-semibold ${isOvertime || recordingTime < 30 ? "text-red-500" : "text-gray-900"}`}>
                {formatRecordingTime(recordingTime)}
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

        <Button
          size="lg"
          onClick={handleNext}
          disabled={isBusy || !sessionId || !currentQ}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
        >
          {currentQuestion < questionCount - 1 ? "?ㅼ쓬 臾몄젣" : "?쒗뿕 醫낅즺"}
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
            <p className="mt-3 text-center text-sm text-gray-600">?좎떆留?湲곕떎??二쇱꽭??</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
