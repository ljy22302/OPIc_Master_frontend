import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Square, Volume2 } from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import {
  createEvaluationSession,
  uploadAnswerEvaluation,
  type EvaluationAnswer,
  type EvaluationQuestionPayload,
} from "../lib/evaluationApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import ossCharacter from "./OSS_character.png";
import { mockTestQuestions } from "./mockTestQuestions";

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
};

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
  } = (location.state as MockTestQuestionState) ?? {};

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    Math.min(initialCurrentQuestion, mockTestQuestions.length - 1),
  );
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
  const [questionResults, setQuestionResults] = useState<EvaluationAnswer[]>(initialQuestionResults);

  const {
    error,
    isRecording,
    isUploading,
    lastRecording,
    resetRecording,
    startRecording,
    stopRecording,
  } = useSpeechToTextRecorder({
    questionId: `mock-test-${mockTestQuestions[currentQuestion].id}`,
    language: "en",
  });

  useEffect(() => {
    let isMounted = true;

    if (sessionId) {
      return undefined;
    }

    const payloadQuestions: EvaluationQuestionPayload[] = mockTestQuestions.map((question, index) => ({
      questionId: `mock-test-${question.id}`,
      questionOrder: index + 1,
      questionText: question.text,
      questionType: question.type,
      translation: question.translation,
      category: question.type,
    }));

    const run = async () => {
      try {
        setIsPreparingSession(true);
        setSessionError("");
        const session = await createEvaluationSession({
          mode: "mock_test",
          title: "Mock Test Session",
          difficulty: difficulty || undefined,
          metadata: {
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

        setSessionId(session.id);
        setQuestionResults(session.answers);
      } catch (sessionCreateError) {
        if (!isMounted) {
          return;
        }
        setSessionError(
          sessionCreateError instanceof Error
            ? sessionCreateError.message
            : "모의고사 세션 준비에 실패했습니다.",
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

  const totalProgress = ((currentQuestion + 1) / mockTestQuestions.length) * 100;
  const recordingProgress = Math.min(
    ((recordingLimit - Math.max(recordingTime, 0)) / recordingLimit) * 100,
    100,
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(recordingTime, 0)) / recordingLimit) * 100,
    100,
  );
  const isOvertime = recordingTime < 0;
  const progressSteps = Array.from({ length: mockTestQuestions.length }, (_, index) => index + 1);
  const currentQ = mockTestQuestions[currentQuestion];
  const currentSavedResult = questionResults[currentQuestion];
  const isBusy = isUploading || isEvaluating || isPreparingSession;

  const difficultyLabel = difficulty === "3-4" ? "레벨 3-4" : difficulty === "5-6" ? "레벨 5-6" : "";
  const statusLabel = {
    company: "회사원",
    remote: "재택근무",
    teacher: "교사",
    unemployed: "일 경험 없음",
  }[currentStatus] || "";
  const studentLabel = {
    student: "학생",
    graduated: "졸업 후 5년 지남",
  }[studentStatus] || "";
  const livingSituationLabel = {
    alone: "1인 거주",
    family: "가족과 함께",
    dorm: "기숙사",
    friends: "친구와 함께",
    military: "군대",
  }[livingSituation] || "";
  const questionTypeLabel = {
    "Self-Intro": "자기소개",
    "Topic": "선택 주제",
    "Role Play": "롤플레이",
    "Follow-up": "돌발 질문",
  }[currentQ.type] || currentQ.type;

  const handleRecordingToggle = async () => {
    if (isBusy) {
      return;
    }

    if (!isRecording) {
      setRecordingTime(recordingLimit);
      resetRecording();
      await startRecording();
      return;
    }

    await stopRecording();
  };

  const handleNext = async () => {
    if (transitionPhase || isBusy || !sessionId) {
      return;
    }

    const nextAction: TransitionAction = currentQuestion < mockTestQuestions.length - 1 ? "next" : "script";

    try {
      setTransitionMessage(
        nextAction === "script"
          ? "스크립트 화면을 준비하고 있습니다..."
          : "답변을 저장하고 평가하고 있습니다...",
      );
      setTransitionPhase("saving");
      setIsEvaluating(true);

      const recording = isRecording ? await stopRecording() : lastRecording;
      const evaluation = await uploadAnswerEvaluation({
        sessionId,
        mode: "mock_test",
        questionId: `mock-test-${currentQ.id}`,
        questionOrder: currentQuestion + 1,
        questionText: currentQ.text,
        questionType: currentQ.type,
        clientDurationSeconds: recording?.durationSeconds || 0,
        audioBlob: recording?.audioBlob || null,
        fileName: recording?.fileName,
      });

      const nextResults = Array.from({ length: mockTestQuestions.length }, (_, index) => questionResults[index] || null);
      nextResults[currentQuestion] = evaluation;
      setQuestionResults(nextResults.filter(Boolean) as EvaluationAnswer[]);

      const transitionDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await transitionDelay(800);

      if (nextAction === "next") {
        setTransitionPhase("preparing");
        setTransitionMessage("다음 문제로 이동 중입니다...");
        await transitionDelay(700);
        setCurrentQuestion((prev) => prev + 1);
        setRecordingTime(recordingLimit);
        setPlayCount(0);
        setShowQuestion(false);
        setShowTranslation(false);
        resetRecording();
      } else {
        navigate(`/mocktest/script?sessionId=${sessionId}`, {
          state: {
            sessionId,
            questionCount: mockTestQuestions.length,
            questionResults: nextResults.filter(Boolean),
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
          : "답변 평가에 실패했습니다.",
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
                if (window.confirm("모의고사를 나가시겠습니까? 지금까지 진행한 내용은 저장되지 않습니다.")) {
                  navigate("/mocktest/setup");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">문항</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentQuestion + 1} / {mockTestQuestions.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">전체 시간</p>
                <p className="text-sm font-bold text-gray-900">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {(difficultyLabel ||
          statusLabel ||
          studentLabel ||
          livingSituationLabel ||
          selectedLeisure.length > 0 ||
          selectedHobbies.length > 0 ||
          selectedExercises.length > 0 ||
          selectedTravel.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {difficultyLabel && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {difficultyLabel}
                </span>
              )}
              {statusLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  현재 상태: {statusLabel}
                </span>
              )}
              {studentLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  학생 여부: {studentLabel}
                </span>
              )}
              {livingSituationLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  거주 형태: {livingSituationLabel}
                </span>
              )}
              {selectedLeisure.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  여가 활동: {selectedLeisure.join(", ")}
                </span>
              )}
              {selectedHobbies.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  취미 관심사: {selectedHobbies.join(", ")}
                </span>
              )}
              {selectedExercises.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  운동: {selectedExercises.join(", ")}
                </span>
              )}
              {selectedTravel.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  휴가/출장: {selectedTravel.join(", ")}
                </span>
              )}
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
                    <img
                      src={ossCharacter}
                      alt="질문 캐릭터"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (playCount < 2) {
                      setPlayCount((prev) => prev + 1);
                    }
                  }}
                  disabled={playCount >= 2}
                  className="gap-2 text-gray-700 disabled:opacity-40"
                >
                  <Volume2 className="h-4 w-4" />
                  문제 듣기
                </Button>
                <p className="mt-1 text-center text-xs text-gray-500">최대 2회 재생</p>
              </div>

              <div className="flex flex-col justify-center">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <span
                    className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                      currentQ.type === "Self-Intro"
                        ? "bg-yellow-100 text-gray-900"
                        : currentQ.type === "Role Play"
                          ? "bg-gray-200 text-gray-900"
                          : currentQ.type === "Follow-up"
                            ? "bg-gray-300 text-gray-900"
                            : "bg-yellow-200 text-gray-900"
                    }`}
                  >
                    {questionTypeLabel}
                  </span>
                </motion.div>
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
                      {currentQ.text}
                    </p>

                    {!showTranslation && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTranslation(true)}
                        className="gap-2 border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100"
                      >
                        해석 보기
                      </Button>
                    )}

                    {showTranslation && (
                      <motion.p
                        key={`translation-${currentQuestion}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[36rem] text-center text-sm font-medium leading-relaxed text-gray-700"
                      >
                        {currentQ.translation}
                      </motion.p>
                    )}
                  </motion.div>
                ) : (
                  <div className="mt-6 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setShowQuestion(true);
                        setShowTranslation(false);
                      }}
                      className="gap-2 border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100"
                    >
                      문제 보기
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
              disabled={isBusy || !sessionId}
              className="gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isRecording ? "녹음 종료" : "녹음 시작"}
            </Button>
          </div>

          {isPreparingSession && (
            <p className="mb-4 text-center text-sm text-gray-500">모의고사 세션 준비 중...</p>
          )}

          {isEvaluating && (
            <p className="mb-4 text-center text-sm text-gray-500">답변 업로드 및 평가 중...</p>
          )}

          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          {sessionError && <p className="mb-4 text-center text-sm text-red-500">{sessionError}</p>}

          {currentSavedResult?.usedTranscript && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              방금 저장된 스크립트: {currentSavedResult.usedTranscript}
            </div>
          )}

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">녹음 시간</span>
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
          disabled={isBusy || !sessionId}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
        >
          {currentQuestion < mockTestQuestions.length - 1 ? "다음 문제" : "시험 종료"}
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
            <p className="mt-3 text-center text-sm text-gray-600">잠시만 기다려주세요.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
