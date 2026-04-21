import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, Mic, Square, Volume2 } from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import ossCharacter from "./OSS_character.png";
import { mockTestQuestions } from "./mockTestQuestions";

type TransitionPhase = "saving" | "preparing" | null;
type TransitionAction = "next" | "script" | null;

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
    savedTranscripts: initialSavedTranscripts = [] as string[],
  } = (location.state as {
    difficulty?: string;
    currentStatus?: string;
    studentStatus?: string;
    livingSituation?: string;
    selectedLeisure?: string[];
    selectedHobbies?: string[];
    selectedExercises?: string[];
    selectedTravel?: string[];
    currentQuestion?: number;
    savedTranscripts?: string[];
  }) ?? {};

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    Math.min(initialCurrentQuestion, mockTestQuestions.length - 1)
  );
  const [totalTime, setTotalTime] = useState(2400);
  const [recordingTime, setRecordingTime] = useState(recordingLimit);
  const [playCount, setPlayCount] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [savedTranscripts, setSavedTranscripts] = useState<string[]>(() => {
    const base = Array(mockTestQuestions.length).fill("");
    return base.map((value, index) => initialSavedTranscripts[index] ?? value);
  });
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
  const [transitionAction, setTransitionAction] = useState<TransitionAction>(null);
  const [transitionMessage, setTransitionMessage] = useState("");

  const {
    error,
    isRecording,
    isUploading,
    resetTranscript,
    startRecording,
    stopRecording,
    transcript,
  } = useSpeechToTextRecorder({
    questionId: `mock-test-${mockTestQuestions[currentQuestion].id}`,
    language: "en",
  });

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
    100
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(recordingTime, 0)) / recordingLimit) * 100,
    100
  );
  const isOvertime = recordingTime < 0;
  const progressSteps = Array.from({ length: mockTestQuestions.length }, (_, index) => index + 1);
  const currentQ = mockTestQuestions[currentQuestion];

  const difficultyLabel = difficulty === "3-4" ? "Level 3-4" : difficulty === "5-6" ? "Level 5-6" : "";
  const statusLabel = {
    company: "Office Worker",
    remote: "Remote Worker",
    teacher: "Teacher",
    unemployed: "Unemployed",
  }[currentStatus] || "";
  const studentLabel = {
    student: "Student",
    graduated: "Graduated",
  }[studentStatus] || "";
  const livingSituationLabel = {
    alone: "Alone",
    family: "With Family",
    dorm: "Dorm",
    friends: "With Friends",
    military: "Military",
  }[livingSituation] || "";

  const handleRecordingToggle = async () => {
    if (isUploading) {
      return;
    }

    if (!isRecording) {
      setRecordingTime(recordingLimit);
      await startRecording();
      return;
    }

    stopRecording();
  };

  const handleNext = async () => {
    if (transitionPhase || isUploading) {
      return;
    }

    const nextAction: TransitionAction =
      currentQuestion < mockTestQuestions.length - 1 ? "next" : "script";
    const currentAnswer = isRecording ? await stopRecording() : transcript;
    const nextSavedTranscripts = [...savedTranscripts];
    nextSavedTranscripts[currentQuestion] = currentAnswer.trim();
    setSavedTranscripts(nextSavedTranscripts);

    setTransitionAction(nextAction);
    setTransitionMessage(
      nextAction === "script" ? "스크립트 화면으로 이동 중입니다..." : "Saving your answer..."
    );
    setTransitionPhase("saving");

    const transitionDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await transitionDelay(1000);

    if (nextAction === "next") {
      setTransitionPhase("preparing");
      setTransitionMessage("다음 문제로 이동 중입니다...");
      await transitionDelay(1000);
      setCurrentQuestion((prev) => prev + 1);
      setRecordingTime(recordingLimit);
      setPlayCount(0);
      setShowQuestion(false);
      setShowTranslation(false);
      resetTranscript();
    } else if (nextAction === "script") {
      navigate("/mocktest/script", {
        state: {
          questionCount: mockTestQuestions.length,
          transcripts: nextSavedTranscripts,
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

    setTransitionPhase(null);
    setTransitionAction(null);
    setTransitionMessage("");
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
                if (window.confirm("Leave the mock test? Progress will not be saved.")) {
                  navigate("/mocktest/setup");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">Question</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentQuestion + 1} / {mockTestQuestions.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Time</p>
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
                  Status: {statusLabel}
                </span>
              )}
              {studentLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Student: {studentLabel}
                </span>
              )}
              {livingSituationLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Living: {livingSituationLabel}
                </span>
              )}
              {selectedLeisure.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Leisure: {selectedLeisure.join(", ")}
                </span>
              )}
              {selectedHobbies.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Hobbies: {selectedHobbies.join(", ")}
                </span>
              )}
              {selectedExercises.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Exercise: {selectedExercises.join(", ")}
                </span>
              )}
              {selectedTravel.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Travel: {selectedTravel.join(", ")}
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
                      alt="Practice question"
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
                  Play Question
                </Button>
                <p className="mt-1 text-center text-xs text-gray-500">Up to 2 plays</p>
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
                    {currentQ.type}
                  </span>
                </motion.div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-10">
                  {progressSteps.map((step) => {
                    const isCurrent = step === currentQuestion + 1;
                    return (
                      <div
                        key={step}
                        className={`flex h-7 items-center justify-center rounded-sm border text-[11px] font-semibold sm:h-8 sm:text-xs ${
                          isCurrent
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-gray-200 text-white"
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
                      Show Question
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
              disabled={isUploading}
              className="gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>

          {isUploading && (
            <p className="mb-4 text-center text-sm text-gray-500">
              Sending your audio to the STT server...
            </p>
          )}

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">Recording Time</span>
              <span
                className={`font-semibold ${
                  isOvertime || recordingTime < 30 ? "text-red-500" : "text-gray-900"
                }`}
              >
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

        {currentQ.type !== "Role Play" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-900" />
              <p className="text-sm text-gray-700">
                Hints and saved-question features are not available during the mock test.
              </p>
            </div>
          </Card>
        )}

        <Button
          size="lg"
          onClick={handleNext}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
        >
          {currentQuestion < mockTestQuestions.length - 1 ? "Next Question" : "Finish Test"}
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
