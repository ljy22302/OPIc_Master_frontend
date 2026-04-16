import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bookmark,
  HelpCircle,
  Lightbulb,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import ossCharacter from "./OSS_character.png";

const questions = [
  {
    id: 1,
    text: "Tell me about your favorite cafe. What makes it special to you?",
    hint: "cafe, atmosphere, menu, favorite",
  },
  {
    id: 2,
    text: "Describe a memorable travel experience you had recently.",
    hint: "destination, activities, people, feelings",
  },
  {
    id: 3,
    text: "What kind of exercise do you enjoy doing and why?",
    hint: "exercise, frequency, benefits, enjoyment",
  },
];

type TransitionPhase = "saving" | "preparing" | null;
type TransitionAction = "next" | "result" | null;

function PlaceholderImage() {
  return (
    <svg viewBox="0 0 520 360" className="h-full w-full" role="img" aria-label="Question illustration">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="100%" stopColor="#fff1a8" />
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect width="520" height="360" rx="28" fill="url(#g1)" />
      <rect x="120" y="52" width="280" height="220" rx="28" fill="url(#g2)" stroke="#eab308" strokeWidth="4" />
      <rect x="160" y="88" width="200" height="20" rx="10" fill="#facc15" />
      <rect x="160" y="124" width="160" height="14" rx="7" fill="#cbd5e1" />
      <rect x="160" y="152" width="180" height="14" rx="7" fill="#cbd5e1" />
      <rect x="160" y="180" width="140" height="14" rx="7" fill="#cbd5e1" />
      <circle cx="260" cy="208" r="34" fill="#fde68a" />
      <path
        d="M260 190c-10 0-18 8-18 18v8c0 10 8 18 18 18s18-8 18-18v-8c0-10-8-18-18-18zm-7 18c0-4 3-7 7-7s7 3 7 7v8c0 4-3 7-7 7s-7-3-7-7v-8z"
        fill="#111827"
        opacity="0.9"
      />
      <rect x="86" y="242" width="348" height="54" rx="18" fill="#fff" stroke="#fde68a" strokeWidth="4" />
      <path
        d="M126 268c18-10 34-10 52 0s34 10 52 0 34-10 52 0 34 10 52 0 34-10 52 0"
        stroke="#fbbf24"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="94" cy="64" r="22" fill="#f59e0b" opacity="0.18" />
      <circle cx="430" cy="86" r="18" fill="#f59e0b" opacity="0.18" />
    </svg>
  );
}

export function PracticeQuestion() {
  const recordingLimit = 120;
  const navigate = useNavigate();
  const location = useLocation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recordingLimit);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
  const [transitionAction, setTransitionAction] = useState<TransitionAction>(null);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const {
    difficultyLabel = "",
    selectedType = "",
    selectedTypeLabel = "",
    selectedTopicLabels = [] as string[],
  } =
    (location.state as {
      difficultyLabel?: string;
      selectedType?: string;
      selectedTypeLabel?: string;
      selectedTopicLabels?: string[];
    }) ?? {};

  const {
    error,
    isRecording,
    isUploading,
    resetTranscript,
    startRecording,
    stopRecording,
    transcript,
  } = useSpeechToTextRecorder({
    questionId: `practice-${questions[currentQuestion].id}`,
    language: "en",
  });

  const questionLimit = selectedType === "random" ? 2 : questions.length;

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRecording, timeLeft]);

  useEffect(() => {
    if (!transitionPhase) {
      return;
    }

    const timer = setTimeout(() => {
      if (transitionPhase === "saving") {
        setTransitionPhase("preparing");
        setTransitionMessage(
          transitionAction === "result" ? "Preparing your result..." : "Preparing the next question..."
        );
        return;
      }

      if (transitionAction === "next") {
        if (currentQuestion < questionLimit - 1) {
          setCurrentQuestion((prev) => prev + 1);
          setTimeLeft(recordingLimit);
          setShowQuestion(false);
          setShowHint(false);
          setPlayCount(0);
          resetTranscript();
          stopRecording(true);
        } else {
          navigate("/practice/result", {
            state: {
              questionCount: questionLimit,
              selectedType,
            },
          });
        }
      } else if (transitionAction === "result") {
        navigate("/practice/result", {
          state: {
            questionCount: questionLimit,
            selectedType,
          },
        });
      }

      setTransitionPhase(null);
      setTransitionAction(null);
      setTransitionMessage("");
    }, 1000);

    return () => clearTimeout(timer);
  }, [transitionAction, transitionPhase, currentQuestion, navigate, questionLimit, recordingLimit, resetTranscript, selectedType, stopRecording]);

  const displayTypeText = useMemo(() => {
    if (!selectedTypeLabel) {
      return "";
    }

    if (selectedTypeLabel === "콤보형 문제유형" && selectedTopicLabels[0]) {
      return `${selectedTypeLabel} - ${selectedTopicLabels[0]}`;
    }

    return selectedTypeLabel;
  }, [selectedTopicLabels, selectedTypeLabel]);

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
    100
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(timeLeft, 0)) / recordingLimit) * 100,
    100
  );
  const isOvertime = timeLeft < 0;
  const canPlayQuestion = playCount < 2;

  const handleRecordingToggle = async () => {
    if (isUploading) {
      return;
    }

    if (!isRecording) {
      setTimeLeft(recordingLimit);
      await startRecording();
      return;
    }

    stopRecording();
  };

  const handleNext = () => {
    if (transitionPhase) {
      return;
    }

    setTransitionAction(currentQuestion < questionLimit - 1 ? "next" : "result");
    setTransitionMessage("Saving your answer...");
    setTransitionPhase("saving");
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
              Question {currentQuestion + 1} / {questionLimit}
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
                  {imageError ? (
                    <div className="flex h-[214px] w-full items-center justify-center rounded-[22px] bg-white p-4">
                      <PlaceholderImage />
                    </div>
                  ) : (
                    <div className="flex h-[214px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-white p-2">
                      <img
                        src={ossCharacter}
                        alt="OSS_character"
                        className="h-full w-full rounded-[18px] object-contain object-center"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
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
                Play Question
              </Button>
              <p className="mt-1 text-center text-xs text-gray-500">Up to 2 plays</p>
            </div>

            <div className="flex flex-col justify-start">
              <div className="mb-4 grid h-[210px] gap-3 sm:h-[300px] sm:grid-rows-[3fr_2fr] sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuestion((prev) => !prev)}
                  className="h-full w-full"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-yellow-100 bg-yellow-50 px-2 py-3 text-center shadow-md transition hover:bg-yellow-100 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-0">
                    {showQuestion ? (
                      <motion.div
                        key={`question-${currentQuestion}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                      >
                        <p className="text-center text-base font-medium leading-snug text-gray-900 sm:text-lg sm:leading-relaxed">
                          {questions[currentQuestion].text}
                        </p>
                      </motion.div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-yellow-900 sm:text-2xl">
                        <HelpCircle className="h-4 w-4 shrink-0" />
                        Show Question
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className="h-full w-full"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-sky-100 bg-sky-50 px-2 py-3 text-center shadow-md transition hover:bg-sky-100 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-0">
                    {showHint ? (
                      <motion.div
                        key={`hint-${currentQuestion}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                      >
                        <p className="text-base font-medium leading-snug text-gray-700 sm:text-lg sm:leading-relaxed">
                          {questions[currentQuestion].hint}
                        </p>
                      </motion.div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-sky-900 sm:text-2xl">
                        <Lightbulb className="h-4 w-4 shrink-0" />
                        Word Hint
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
                  isOvertime || timeLeft < 30 ? "text-red-500" : "text-gray-900"
                }`}
              >
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

          <div className="min-h-32 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-500">Transcript</p>
            <p className="text-gray-700">
              {transcript || "Your transcript will appear here after you start recording."}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save Question
          </Button>
          <Button
            onClick={handleNext}
            disabled={!!transitionPhase}
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-70"
          >
            {currentQuestion < questionLimit - 1 ? "Next Question" : "See Result"}
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
              <p className="text-center text-2xl font-bold text-gray-900">
                {transitionMessage}
              </p>
              <p className="mt-3 text-center text-sm text-gray-600">
                Please wait a moment.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
