import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Square, FileText, Lightbulb, Bookmark, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const questions = [
  {
    id: 1,
    text: "Tell me about your favorite cafe. What makes it special to you?",
    hint: "location, atmosphere, menu, why you like it",
  },
  {
    id: 2,
    text: "Describe a memorable travel experience you had recently.",
    hint: "destination, activities, people, feelings",
  },
  {
    id: 3,
    text: "What kind of exercise do you enjoy doing and why?",
    hint: "type of exercise, frequency, benefits, enjoyment",
  },
];

export function PracticeQuestion() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [transcript, setTranscript] = useState("");

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

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    setIsRecording(false);
  }, [isRecording, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((120 - timeLeft) / 120) * 100;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(120);
      setIsRecording(false);
      setShowQuestion(false);
      setShowHint(false);
      setTranscript("");
    } else {
      navigate("/practice/result");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/practice/setup")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Character & Question */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          {(difficultyLabel || selectedTypeLabel || selectedTopicLabels.length > 0) && (
            <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {difficultyLabel && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      난이도: {difficultyLabel}
                    </span>
                  )}
                  {selectedTypeLabel && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                      유형: {selectedTypeLabel}
                    </span>
                  )}
                </div>
                {selectedTopicLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTopicLabels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <Card className="p-8 bg-yellow-50 border-2 border-yellow-200">
            {/* Character */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: isRecording ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isRecording ? Infinity : 0,
                }}
                className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center shadow-xl"
              >
                <span className="text-4xl">🎤</span>
              </motion.div>
            </div>

            {/* Question Text (Hidden by default) */}
            {showQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className="text-xl text-center text-gray-900 font-medium">
                  {questions[currentQuestion].text}
                </p>
              </motion.div>
            ) : (
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestion(true)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  문제 확인
                </Button>
              </div>
            )}

            {/* Play Question Audio */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("음성 재생 기능 (추후 구현)")}
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" />
                질문 듣기
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recording Controls */}
        <Card className="p-6 mb-6 bg-white">
          <div className="flex justify-center gap-4 mb-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={() => setIsRecording(true)}
                className="bg-red-500 hover:bg-red-600 text-white gap-2"
              >
                <Mic className="w-5 h-5" />
                녹음 시작
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setIsRecording(false)}
                variant="outline"
                className="gap-2 border-red-500 text-red-500"
              >
                <Square className="w-5 h-5" />
                녹음 중지
              </Button>
            )}
          </div>

          {/* Small Timer */}
          <div className="flex items-center justify-between gap-4 mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-medium text-gray-600">남은 시간</span>
            <span className={`font-semibold ${timeLeft < 30 ? "text-red-500" : "text-gray-900"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Transcript */}
          <div className="bg-gray-50 rounded-lg p-4 min-h-32">
            <p className="text-sm text-gray-500 mb-2">음성 → 텍스트 변환 결과</p>
            <p className="text-gray-700">
              {transcript || "녹음을 시작하면 여기에 텍스트가 표시됩니다..."}
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowHint(!showHint)}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            힌트
          </Button>
          <Button variant="outline" className="gap-2">
            <Bookmark className="w-4 h-4" />
            문제 저장
          </Button>
          <Button
            onClick={handleNext}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
          >
            {currentQuestion < questions.length - 1 ? "다음 문제" : "결과 보기"}
          </Button>
        </div>

        {/* Hint Panel */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">💡 힌트</p>
              <p className="text-sm text-gray-700">
                {questions[currentQuestion].hint}
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}