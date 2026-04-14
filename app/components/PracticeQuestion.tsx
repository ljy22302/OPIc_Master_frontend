import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, FileText, Lightbulb, Mic, Volume2 } from "lucide-react";
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
      <path d="M260 190c-10 0-18 8-18 18v8c0 10 8 18 18 18s18-8 18-18v-8c0-10-8-18-18-18zm-7 18c0-4 3-7 7-7s7 3 7 7v8c0 4-3 7-7 7s-7-3-7-7v-8z" fill="#111827" opacity="0.9" />
      <rect x="86" y="242" width="348" height="54" rx="18" fill="#fff" stroke="#fde68a" strokeWidth="4" />
      <path d="M126 268c18-10 34-10 52 0s34 10 52 0 34-10 52 0 34 10 52 0 34-10 52 0" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="94" cy="64" r="22" fill="#f59e0b" opacity="0.18" />
      <circle cx="430" cy="86" r="18" fill="#f59e0b" opacity="0.18" />
    </svg>
  );
}

export function PracticeQuestion() {
  const recordingLimit = 120;
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recordingLimit);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [transcript] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
  const [transitionAction, setTransitionAction] = useState<TransitionAction>(null);
  const [imageError, setImageError] = useState(false);

  const location = useLocation();
  const {
    difficultyLabel = "",
    selectedTypeLabel = "",
    selectedTopicLabels = [] as string[],
  } =
    (location.state as {
      difficultyLabel?: string;
      selectedTypeLabel?: string;
      selectedTopicLabels?: string[];
    }) ?? {};

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
        return;
      }

      if (transitionAction === "next") {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((prev) => prev + 1);
          setTimeLeft(recordingLimit);
          setIsRecording(false);
          setShowQuestion(false);
          setShowHint(false);
          setPlayCount(0);
        } else {
          navigate("/practice/result");
        }
      } else if (transitionAction === "result") {
        navigate("/practice/result");
      }

      setTransitionPhase(null);
      setTransitionAction(null);
    }, 1200);

    return () => clearTimeout(timer);
  }, [transitionAction, transitionPhase, currentQuestion, navigate, recordingLimit]);

  const displayTypeText = useMemo(() => {
    if (!selectedTypeLabel) {
      return "";
    }

    if (selectedTypeLabel === "주제선택분야" && selectedTopicLabels[0]) {
      return `${selectedTypeLabel} - ${selectedTopicLabels[0]}`;
    }

    return selectedTypeLabel;
  }, [selectedTopicLabels, selectedTypeLabel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  const handleNext = () => {
    if (transitionPhase) {
      return;
    }

    setTransitionAction(currentQuestion < questions.length - 1 ? "next" : "result");
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
              Question {currentQuestion + 1} / {questions.length}
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
              <div className="mb-4 inline-flex max-w-full rounded-[36px] border border-yellow-200 bg-white p-4 shadow-md">
                {imageError ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-[28px] bg-white p-4">
                    <PlaceholderImage />
                  </div>
                ) : (
                  <div className="flex h-[300px] w-full items-center justify-center rounded-[28px] bg-white p-3">
                    <img
                      src={ossCharacter}
                      alt="Practice question"
                      className="h-full w-auto max-w-full rounded-[24px] object-contain"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (canPlayQuestion) {
                    setPlayCount((prev) => prev + 1);
                  }
                }}
                disabled={!canPlayQuestion}
                className="gap-2 text-gray-700 disabled:opacity-40"
              >
                <Volume2 className="h-4 w-4" />
                Play Question
              </Button>
              <p className="mt-1 text-center text-xs text-gray-500">2번 듣기 가능</p>
            </div>

            <div className="flex flex-col justify-start">
              {showQuestion ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <p className="text-xl font-medium leading-relaxed text-gray-900">
                    {questions[currentQuestion].text}
                  </p>
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowQuestion(true)}
                  className="mb-3 w-full justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Show Question
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowHint(!showHint)}
                className="w-full justify-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Hint
              </Button>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <p className="mb-2 text-base font-semibold text-gray-900">Answer Hint</p>
                    <p className="text-base leading-relaxed text-gray-700">
                      {questions[currentQuestion].hint}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </Card>

        <Card className="mb-6 mt-6 bg-white p-6">
          <div className="mb-4 flex justify-center">
            <Button
              size="lg"
              onClick={() => setIsRecording(true)}
              disabled={isRecording}
              className="gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              <Mic className="h-5 w-5" />
              {isRecording ? "녹음 중" : "Start Recording"}
            </Button>
          </div>

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
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Result"}
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
                {transitionPhase === "saving" ? "답변 저장 중" : "다음문제 준비 중"}
              </p>
              <p className="mt-3 text-center text-sm text-gray-600">
                잠시만 기다려 주세요.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
