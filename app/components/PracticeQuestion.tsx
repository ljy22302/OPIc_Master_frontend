import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bookmark,
  FileText,
  Lightbulb,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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
  const [showQuestion, setShowQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);

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

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    stopRecording();
  }, [isRecording, stopRecording, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(120);
      stopRecording(true);
      setShowQuestion(false);
      setShowHint(false);
      resetTranscript();
    } else {
      navigate("/practice/result");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          {(difficultyLabel || selectedTypeLabel || selectedTopicLabels.length > 0) && (
            <div className="mb-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {difficultyLabel && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      레벨: {difficultyLabel}
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

          <Card className="border-2 border-yellow-200 bg-yellow-50 p-8">
            <div className="mb-6 flex justify-center">
              <motion.div
                animate={{
                  scale: isRecording ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isRecording ? Infinity : 0,
                }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-xl"
              >
                <span className="text-4xl">🙂</span>
              </motion.div>
            </div>

            {showQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className="text-center text-xl font-medium text-gray-900">
                  {questions[currentQuestion].text}
                </p>
              </motion.div>
            ) : (
              <div className="mb-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestion(true)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  문제 확인
                </Button>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("음성 재생 기능은 추후 구현 예정입니다.")}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                질문 듣기
              </Button>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex justify-center gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isUploading}
                className="gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <Mic className="h-5 w-5" />
                녹음 시작
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => stopRecording()}
                variant="outline"
                className="gap-2 border-red-500 text-red-500"
              >
                <Square className="h-5 w-5" />
                녹음 종료
              </Button>
            )}
          </div>

          {isUploading && (
            <p className="mb-4 text-center text-sm text-gray-500">
              음성을 STT 서버로 전송하고 있습니다...
            </p>
          )}

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-medium text-gray-600">남은 시간</span>
            <span className={`font-semibold ${timeLeft < 30 ? "text-red-500" : "text-gray-900"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="min-h-32 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-500">음성 텍스트 변환 결과</p>
            <p className="text-gray-700">
              {transcript || "녹음을 시작하면 여기에 텍스트가 표시됩니다..."}
            </p>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowHint(!showHint)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            힌트
          </Button>
          <Button variant="outline" className="gap-2">
            <Bookmark className="h-4 w-4" />
            문제 저장
          </Button>
          <Button
            onClick={handleNext}
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          >
            {currentQuestion < questions.length - 1 ? "다음 문제" : "결과 보기"}
          </Button>
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">답변 힌트</p>
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
